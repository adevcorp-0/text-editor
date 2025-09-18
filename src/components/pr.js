import React, { useMemo, useRef } from "react";
import { Shape } from "react-konva";
import piecewiseQuadPoint from "../helpers/bezier";

export default function WarpComponent({
    text = "Hello warped world!",
    fontFamily = "Inter, system-ui, Arial",
    fontSize = 48,
    fill = "#111",
    top,
    bottom,
    sliceCount = 200,
    overlap = 1,
    draggable = false,
    padding = 0,
    onDragStart,
    onDragMove,
    onDragEnd,
}) {
    const texRef = useRef(null);
    const imgSize = useRef({ w: 0, h: 0 });

    // build a canvas texture when props change
    useMemo(() => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        ctx.font = `${fontSize}px ${fontFamily}`;
        const textW = Math.ceil(ctx.measureText(text).width);
        const textH = fontSize;

        canvas.width = textW + padding * 2;
        canvas.height = textH + padding * 2;

        const ctx2 = canvas.getContext("2d");
        ctx2.font = `${fontSize}px ${fontFamily}`;
        ctx2.fillStyle = fill;
        ctx2.textBaseline = "middle";
        ctx2.clearRect(0, 0, canvas.width, canvas.height);
        ctx2.fillText(text, padding, textH / 2 + padding);

        texRef.current = canvas;
        imgSize.current = { w: canvas.width, h: canvas.height };
    }, [text, fontFamily, fontSize, fill, padding]);

    return (
        <Shape
            draggable={draggable}
            sceneFunc={(ctx, shape) => {
                const img = texRef.current;
                if (!img) return;

                const { w: srcW, h: srcH } = imgSize.current;
                const S = Math.max(1, sliceCount);
                const sliceW = srcW / S;

                ctx.save();
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = "high";

                for (let i = 0; i < S; i++) {
                    const t0 = i / S;
                    const t1 = (i + 1) / S;

                    const top0 = piecewiseQuadPoint(top.p0, top.mid, top.p2, top.h1, top.h2, t0);
                    const top1 = piecewiseQuadPoint(top.p0, top.mid, top.p2, top.h1, top.h2, t1);
                    const bot0 = piecewiseQuadPoint(bottom.p0, bottom.mid, bottom.p2, bottom.h1, bottom.h2, t0);
                    const bot1 = piecewiseQuadPoint(bottom.p0, bottom.mid, bottom.p2, bottom.h1, bottom.h2, t1);

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

                    const sliceSrcX = i * sliceW;
                    const sliceSrcW = i === S - 1 ? srcW - sliceSrcX : sliceW + overlap;

                    // multiply current transform instead of replacing it
                    ctx.save();
                    ctx.transform(a, b, c, d, e, f);
                    ctx.drawImage(img, sliceSrcX, 0, sliceSrcW, srcH, 0, 0, sliceSrcW, srcH);
                    ctx.restore();
                }

                ctx.restore();
            }}
            hitFunc={(ctx, shape) => {
                ctx.beginPath();
                for (let i = 0; i <= sliceCount; i++) {
                    const t = i / sliceCount;
                    const p = piecewiseQuadPoint(top.p0, top.mid, top.p2, top.h1, top.h2, t);
                    i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
                }
                for (let i = sliceCount; i >= 0; i--) {
                    const t = i / sliceCount;
                    const p = piecewiseQuadPoint(bottom.p0, bottom.mid, bottom.p2, bottom.h1, bottom.h2, t);
                    ctx.lineTo(p.x, p.y);
                }
                ctx.closePath();
                ctx.fillStrokeShape(shape);
            }}
            onDragStart={onDragStart}
            onDragMove={onDragMove}
            onDragEnd={onDragEnd}
            listening
        />
    );
}
