import React, { useEffect, useMemo, useRef, useState } from "react";
import piecewiseQuadPoint from "../helpers/bezier";

/** Build a path "d" from sampled points (for guide display) */
function pathFromPoints(pts) {
    if (!pts.length) return "";
    const [x0, y0] = pts[0];
    return "M " + [x0, y0].join(" ") + " " + pts.slice(1).map(([x, y]) => "L " + x + " " + y).join(" ");
}

/** Compute SVG matrix(a b c d e f) mapping a source rect slice to a destination parallelogram */
function affineForSlice(top0, top1, bot0, bot1, srcSliceW, srcH) {
    // Use average of top and bottom for horizontal direction (u), and left edge for vertical (v)
    const u = {
        x: (top1.x - top0.x + bot1.x - bot0.x) * 0.5,
        y: (top1.y - top0.y + bot1.y - bot0.y) * 0.5,
    };
    const v = { x: bot0.x - top0.x, y: bot0.y - top0.y };

    // Map (0,0) -> top0; (sliceW,0) along u; (0,srcH) along v
    const a = u.x / srcSliceW;
    const b = u.y / srcSliceW;
    const c = v.x / srcH;
    const d = v.y / srcH;
    const e = top0.x;
    const f = top0.y;

    return { a, b, c, d, e, f };
}

/** WarpedTextSVG: pure SVG full-warp using many affine slices */
export default function WarpedTextSVG() {
    const [pts, setPts] = useState({
        // Top edge
        left: { x: 100, y: 200 },
        mid: { x: 300, y: 200 },
        right: { x: 500, y: 200 },
        h1: { x: 200, y: 200 },
        h2: { x: 400, y: 200 },
        // Bottom edge
        leftB: { x: 100, y: 320 },
        midB: { x: 300, y: 320 },
        rightB: { x: 500, y: 320 },
        b1: { x: 200, y: 320 },
        b2: { x: 400, y: 320 },
    });

    /** keep handles collinear through mid (independent distances, no mirroring) */
    const keepCollinear = (handleKey, otherHandleKey, midKey, np) => {
        const mid = np[midKey];
        const handle = np[handleKey];
        const other = np[otherHandleKey];
        const vx = other.x - mid.x;
        const vy = other.y - mid.y;
        const len2 = vx * vx + vy * vy || 1;
        const t = ((handle.x - mid.x) * vx + (handle.y - mid.y) * vy) / len2;
        np[handleKey] = { x: mid.x + t * vx, y: mid.y + t * vy };
    };

    const onDrag = (key, e) => {
        const np = { ...pts, [key]: { x: e.clientX, y: e.clientY } };
        if (key === "mid") {
            const dx = np.mid.x - pts.mid.x;
            const dy = np.mid.y - pts.mid.y;
            np.h1 = { x: pts.h1.x + dx, y: pts.h1.y + dy };
            np.h2 = { x: pts.h2.x + dx, y: pts.h2.y + dy };
        }
        if (key === "midB") {
            const dx = np.midB.x - pts.midB.x;
            const dy = np.midB.y - pts.midB.y;
            np.b1 = { x: pts.b1.x + dx, y: pts.b1.y + dy };
            np.b2 = { x: pts.b2.x + dx, y: pts.b2.y + dy };
        }
        if (key === "h1") keepCollinear("h1", "h2", "mid", np);
        if (key === "h2") keepCollinear("h2", "h1", "mid", np);
        if (key === "b1") keepCollinear("b1", "b2", "midB", np);
        if (key === "b2") keepCollinear("b2", "b1", "midB", np);
        setPts(np);
    };

    /** Offscreen canvas → dataURL of text */
    const [dataUrl, setDataUrl] = useState(null);
    const srcSize = useRef({ w: 0, h: 0 });

    useEffect(() => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const text = "Hello World!";
        const fontSize = 48;
        const fontFamily = "Inter, system-ui, Arial";
        const lineHeight = Math.round(fontSize * 1.25);
        ctx.font = `${fontSize}px ${fontFamily}`;
        const w = Math.ceil(ctx.measureText(text).width) + 32;
        const h = lineHeight + 32;

        canvas.width = w;
        canvas.height = h;
        ctx.font = `${fontSize}px ${fontFamily}`;
        ctx.fillStyle = "#111";
        ctx.textBaseline = "middle";
        ctx.fillText(text, 16, h / 2);

        srcSize.current = { w, h };
        setDataUrl(canvas.toDataURL("image/png"));
    }, []);

    const SLICE_COUNT = 160;

    /** Sample curves for guide display */
    const topSamples = useMemo(() => {
        const arr = [];
        for (let i = 0; i <= 140; i++) {
            const t = i / 140;
            const p = piecewiseQuadPoint(pts.left, pts.mid, pts.right, pts.h1, pts.h2, t);
            arr.push([p.x, p.y]);
        }
        return arr;
    }, [pts]);
    const botSamples = useMemo(() => {
        const arr = [];
        for (let i = 0; i <= 140; i++) {
            const t = i / 140;
            const p = piecewiseQuadPoint(pts.leftB, pts.midB, pts.rightB, pts.b1, pts.b2, t);
            arr.push([p.x, p.y]);
        }
        return arr;
    }, [pts]);

    /** Build slice entries */
    const slices = useMemo(() => {
        if (!dataUrl) return [];
        const { w: srcW, h: srcH } = srcSize.current;
        const sliceW = srcW / SLICE_COUNT;

        const out = [];
        for (let i = 0; i < SLICE_COUNT; i++) {
            const t0 = i / SLICE_COUNT;
            const t1 = (i + 1) / SLICE_COUNT;

            const top0 = piecewiseQuadPoint(pts.left, pts.mid, pts.right, pts.h1, pts.h2, t0);
            const top1 = piecewiseQuadPoint(pts.left, pts.mid, pts.right, pts.h1, pts.h2, t1);
            const bot0 = piecewiseQuadPoint(pts.leftB, pts.midB, pts.rightB, pts.b1, pts.b2, t0);
            const bot1 = piecewiseQuadPoint(pts.leftB, pts.midB, pts.rightB, pts.b1, pts.b2, t1);

            // Affine for this slice
            const m = affineForSlice(top0, top1, bot0, bot1, sliceW, srcH);

            // We render a nested <svg> that crops the full image to [i*sliceW .. (i+1)*sliceW]
            const viewBox = `${i * sliceW} 0 ${sliceW} ${srcH}`;

            out.push({
                key: i,
                transform: `matrix(${m.a} ${m.b} ${m.c} ${m.d} ${m.e} ${m.f})`,
                viewBox,
                durl: dataUrl,
                dstW: sliceW,
                dstH: srcH,
                imgW: srcW,
                imgH: srcH,
            });
        }
        return out;
    }, [dataUrl, pts]);

    // Simple draggable handles: use onMouseDown+move on the SVG itself
    const [dragging, setDragging] = useState(null);
    const onMouseDown = (name) => (e) => {
        e.stopPropagation();
        setDragging(name);
    };
    const onMouseMove = (e) => {
        if (!dragging) return;
        onDrag(dragging, e);
    };
    const onMouseUp = () => setDragging(null);

    return (
        <svg
            width="960"
            height="600"
            style={{ background: "#fff", userSelect: "none", cursor: dragging ? "grabbing" : "default" }}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
        >
            {/* Warped text slices */}
            {slices.map((s) => (
                <g key={s.key} transform={s.transform}>
                    {/* Nested SVG = source slice viewport (cropping) */}
                    <svg width={s.dstW} height={s.dstH} viewBox={s.viewBox} overflow="hidden">
                        <image href={s.durl} width={s.imgW} height={s.imgH} />
                    </svg>
                </g>
            ))}

            {/* Guides: top & bottom paths */}
            <path d={pathFromPoints(topSamples)} fill="none" stroke="#4ab3ff" strokeWidth="1" />
            <path d={pathFromPoints(botSamples)} fill="none" stroke="#4ab3ff" strokeWidth="1" />

            {/* Vertical edges */}
            <line x1={pts.left.x} y1={pts.left.y} x2={pts.leftB.x} y2={pts.leftB.y} stroke="#4ab3ff" strokeWidth="1" />
            <line x1={pts.right.x} y1={pts.right.y} x2={pts.rightB.x} y2={pts.rightB.y} stroke="#4ab3ff" strokeWidth="1" />

            {/* Handle connector lines */}
            <polyline
                points={`${pts.h1.x},${pts.h1.y} ${pts.mid.x},${pts.mid.y} ${pts.h2.x},${pts.h2.y}`}
                fill="none" stroke="#ff9800" strokeDasharray="4,4"
            />
            <polyline
                points={`${pts.b1.x},${pts.b1.y} ${pts.midB.x},${pts.midB.y} ${pts.b2.x},${pts.b2.y}`}
                fill="none" stroke="#ff9800" strokeDasharray="4,4"
            />

            {/* Draggable handles */}
            {Object.entries(pts).map(([k, p]) => (
                <circle
                    key={k}
                    cx={p.x}
                    cy={p.y}
                    r="5"
                    fill={k === "mid" || k === "midB" ? "#00e5ff" : k.length === 2 ? "#ff9800" : "#fff"}
                    stroke="#2196f3"
                    strokeWidth="1"
                    onMouseDown={onMouseDown(k)}
                />
            ))}
        </svg>
    );
}
