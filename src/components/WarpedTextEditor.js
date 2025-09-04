import React, { useEffect, useMemo, useRef, useState } from "react";
import { Stage, Layer, Line, Circle, Shape } from "react-konva";
import  piecewiseQuadPoint  from "../helpers/bezier";



function WarpedText({
    text = "Hello warped world!",
    fontFamily = "Inter, system-ui, Arial",
    fontSize = 48,
    fill = "#111",
    top,
    bottom,
    sliceCount = 100,
    padding = 0,
}) {
    const texRef = useRef(null);
    const imgSize = useRef({ w: 0, h: 0 });

    useEffect(() => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const lineHeight = Math.round(fontSize);
        ctx.font = `${fontSize}px ${fontFamily}`;
        const metrics = ctx.measureText(text);
        const textW = Math.ceil(metrics.width);
        const textH = lineHeight;

        const w = textW;
        const h = textH;

        canvas.width = w;
        canvas.height = h;

        ctx.font = `${fontSize}px ${fontFamily}`;
        ctx.fillStyle = fill;
        ctx.textBaseline = "middle";

        ctx.clearRect(0, 0, w, h);
        ctx.fillText(text, padding, h / 2);

        texRef.current = canvas;
        imgSize.current = { w, h };
    }, [text, fontFamily, fontSize, fill, padding]);

    return (
        <Shape
            sceneFunc={(ctx, shape) => {
                const img = texRef.current;
                if (!img) return;

                const { w: srcW, h: srcH } = imgSize.current;
                const S = Math.max(2, sliceCount);
                const sliceW = srcW / S;

                ctx.save();
                ctx.imageSmoothingEnabled = true;

                for (let i = 0; i < S; i++) {
                    const t0 = i / S;
                    const t1 = (i + 1) / S;

                    const top0 = piecewiseQuadPoint(top.p0, top.mid, top.p2, top.h1, top.h2, t0);
                    const top1 = piecewiseQuadPoint(top.p0, top.mid, top.p2, top.h1, top.h2, t1);
                    const bot0 = piecewiseQuadPoint(bottom.p0, bottom.mid, bottom.p2, bottom.h1, bottom.h2, t0);
                    const bot1 = piecewiseQuadPoint(bottom.p0, bottom.mid, bottom.p2, bottom.h1, bottom.h2, t1);

                    const uAvg = { x: (top1.x - top0.x + bot1.x - bot0.x) * 0.5, y: (top1.y - top0.y + bot1.y - bot0.y) * 0.5 };
                    const vLeft = { x: bot0.x - top0.x, y: bot0.y - top0.y };

                    const a = uAvg.x / sliceW;
                    const b = uAvg.y / sliceW;
                    const c = vLeft.x / srcH;
                    const d = vLeft.y / srcH;
                    const e = top0.x;
                    const f = top0.y;

                    ctx.save();
                    ctx.setTransform(a, b, c, d, e, f);
                    ctx.drawImage(
                        img,
                        i * sliceW, 0,
                        sliceW, srcH,
                        0, 0,
                        sliceW, srcH
                    );
                    ctx.restore();
                }
                ctx.restore();
                ctx.fillStrokeShape(shape);
            }}
        />
    );
}

export default function WarpedTextEditor() {
    const [pts, setPts] = useState({
        left: { x: 100, y: 200 },
        mid: { x: 300, y: 200 },
        right: { x: 500, y: 200 },
        h1: { x: 200, y: 200 },
        h2: { x: 400, y: 200 },

        leftB: { x: 100, y: 320 },
        midB: { x: 300, y: 320 },
        rightB: { x: 500, y: 320 },
        b1: { x: 200, y: 320 },
        b2: { x: 400, y: 320 },
    });

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
        const np = { ...pts, [key]: { x: e.target.x(), y: e.target.y() } };
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
    const DISP_SEG = 140;
    const topLinePts = useMemo(() => {
        const arr = [];
        for (let i = 0; i <= DISP_SEG; i++) {
            const t = i / DISP_SEG;
            const p = piecewiseQuadPoint(pts.left, pts.mid, pts.right, pts.h1, pts.h2, t);
            arr.push(p.x, p.y);
        }
        return arr;
    }, [pts]);

    const bottomLinePts = useMemo(() => {
        const arr = [];
        for (let i = 0; i <= DISP_SEG; i++) {
            const t = i / DISP_SEG;
            const p = piecewiseQuadPoint(pts.leftB, pts.midB, pts.rightB, pts.b1, pts.b2, t);
            arr.push(p.x, p.y);
        }
        return arr;
    }, [pts]);

    const top = useMemo(
        () => ({ p0: pts.left, mid: pts.mid, p2: pts.right, h1: pts.h1, h2: pts.h2 }),
        [pts]
    );
    const bottom = useMemo(
        () => ({ p0: pts.leftB, mid: pts.midB, p2: pts.rightB, h1: pts.b1, h2: pts.b2 }),
        [pts]
    );

    return (
        <Stage width={900} height={600} className="bg-white">
            <Layer>
                <WarpedText
                    text="Hello World."
                    fontFamily="Inter, system-ui, Arial"
                    fontSize={100}
                    fill="#000"
                    top={top}
                    bottom={bottom}
                    sliceCount={1000}
                />
                <Line points={topLinePts} stroke="#4ab3ff" strokeWidth={1} />
                <Line points={bottomLinePts} stroke="#4ab3ff" strokeWidth={1} />
                <Line points={[pts.left.x, pts.left.y, pts.leftB.x, pts.leftB.y]} stroke="#4ab3ff" strokeWidth={1} />
                <Line points={[pts.right.x, pts.right.y, pts.rightB.x, pts.rightB.y]} stroke="#4ab3ff" strokeWidth={1} />
                <Line points={[pts.h1.x, pts.h1.y, pts.mid.x, pts.mid.y, pts.h2.x, pts.h2.y]} stroke="#4ab3ff" strokeWidth={1} />
                <Line points={[pts.b1.x, pts.b1.y, pts.midB.x, pts.midB.y, pts.b2.x, pts.b2.y]} stroke="#4ab3ff" strokeWidth={1} />
                {Object.entries(pts).map(([k, p]) => (
                    <Circle
                        key={k}
                        x={p.x}
                        y={p.y}
                        radius={5}
                        fill="#fff"
                        stroke="#4ab3ff"
                        strokeWidth={1}
                        draggable
                        onDragMove={(e) => onDrag(k, e)}
                    />
                ))}
            </Layer>
        </Stage>
    );
}
