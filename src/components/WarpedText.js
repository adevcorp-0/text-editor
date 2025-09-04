import React, { useEffect, useMemo, useRef, useState } from "react";
import { Stage, Layer, Line, Circle, Shape } from "react-konva";

function quadPoint(p0, p1, p2, t) {
    const u = 1 - t;
    return {
        x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x,
        y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y,
    };
}

function WarpedText({
    text = "Hello warped world!",
    fontFamily = "Inter, system-ui, Arial",
    fontSize = 48,
    fill = "#111",
    top,
    bottom,
    sliceCount = 50000,
    padding = 0,
}) {
    const texRef = useRef(null);
    const imgSize = useRef({ w: 0, h: 0 });

    useEffect(() => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const lineHeight = Math.round(fontSize * 1.25);
        ctx.font = `${fontSize}px ${fontFamily}`;
        const metrics = ctx.measureText(text);
        const textW = Math.ceil(metrics.width);
        const textH = lineHeight;

        canvas.width = textW;
        canvas.height = textH;

        ctx.font = `${fontSize}px ${fontFamily}`;
        ctx.fillStyle = fill;
        ctx.textBaseline = "middle";

        ctx.clearRect(0, 0, textW, textH);
        ctx.fillText(text, padding, textH / 2);

        texRef.current = canvas;
        imgSize.current = { w: textW, h: textH };
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

                    const top0 = quadPoint(top.p0, top.mid, top.p2, t0);
                    const top1 = quadPoint(top.p0, top.mid, top.p2, t1);
                    const bot0 = quadPoint(bottom.p0, bottom.mid, bottom.p2, t0);
                    const bot1 = quadPoint(bottom.p0, bottom.mid, bottom.p2, t1);

                    const uAvg = {
                        x: (top1.x - top0.x + bot1.x - bot0.x) * 0.5,
                        y: (top1.y - top0.y + bot1.y - bot0.y) * 0.5,
                    };
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
                        i * sliceW,
                        0,
                        sliceW,
                        srcH,
                        0,
                        0,
                        sliceW,
                        srcH
                    );
                    ctx.restore();
                }

                ctx.restore();
                ctx.fillStrokeShape(shape);
            }}
        />
    );
}

export default function WarppingText() {
    const [pts, setPts] = useState({
        left: { x: 100, y: 200 },
        mid: { x: 300, y: 180 },
        right: { x: 500, y: 200 },

        leftB: { x: 100, y: 320 },
        midB: { x: 300, y: 340 },
        rightB: { x: 500, y: 320 },
    });

    const onDrag = (key, e) => {
        setPts({ ...pts, [key]: { x: e.target.x(), y: e.target.y() } });
    };

    const DISP_SEG = 120;
    const topLinePts = useMemo(() => {
        const arr = [];
        for (let i = 0; i <= DISP_SEG; i++) {
            const t = i / DISP_SEG;
            const p = quadPoint(pts.left, pts.mid, pts.right, t);
            arr.push(p.x, p.y);
        }
        return arr;
    }, [pts]);

    const bottomLinePts = useMemo(() => {
        const arr = [];
        for (let i = 0; i <= DISP_SEG; i++) {
            const t = i / DISP_SEG;
            const p = quadPoint(pts.leftB, pts.midB, pts.rightB, t);
            arr.push(p.x, p.y);
        }
        return arr;
    }, [pts]);

    const top = useMemo(
        () => ({ p0: pts.left, mid: pts.mid, p2: pts.right }),
        [pts]
    );
    const bottom = useMemo(
        () => ({ p0: pts.leftB, mid: pts.midB, p2: pts.rightB }),
        [pts]
    );

    return (
        <Stage width={900} height={600} className="bg-white">
            <Layer>
                <WarpedText
                    text="Hello World!!!"
                    fontFamily="Inter, system-ui, Arial"
                    fontSize={100}
                    fill="#000"
                    top={top}
                    bottom={bottom}
                    sliceCount={1000}
                />
                <Line points={topLinePts} stroke="#4ab3ff" strokeWidth={1} />
                <Line points={bottomLinePts} stroke="#4ab3ff" strokeWidth={1} />
                <Line
                    points={[pts.left.x, pts.left.y, pts.leftB.x, pts.leftB.y]}
                    stroke="#4ab3ff"
                    strokeWidth={1}
                />
                <Line
                    points={[pts.right.x, pts.right.y, pts.rightB.x, pts.rightB.y]}
                    stroke="#4ab3ff"
                    strokeWidth={1}
                />
                {Object.entries(pts).map(([k, p]) => (
                    <Circle
                        key={k}
                        x={p.x}
                        y={p.y}
                        radius={6}
                        fill={k.includes("mid") ? "#00e5ff" : "#fff"}
                        stroke="#2196f3"
                        strokeWidth={1}
                        draggable
                        onDragMove={(e) => onDrag(k, e)}
                    />
                ))}
            </Layer>
        </Stage>
    );
}
