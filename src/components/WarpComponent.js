import React, { useEffect, useRef } from "react";
import { Shape } from "react-konva";
import piecewiseQuadPoint from "../helpers/bezier";

export default function WarpComponent({
    text = "Hello warped world!",
    fontFamily = "Inter, system-ui, Arial",
    fontSize = 48,
    fill = "#111",
    top,
    bottom,
    sliceCount = 160,
    padding = 16,
}) {
    const texRef = useRef(null);
    const imgSize = useRef({ w: 0, h: 0 });

    // build text texture
    useEffect(() => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const lineHeight = Math.round(fontSize * 1.25);
        ctx.font = `${fontSize}px ${fontFamily}`;
        const metrics = ctx.measureText(text);
        const textW = Math.ceil(metrics.width);
        const textH = lineHeight;

        // const w = textW;
        // const h = textH;
        const w = textW + padding * 2;
        const h = textH + padding * 2;

        canvas.width = w;
        canvas.height = h;

        ctx.font = `${fontSize}px ${fontFamily}`;
        ctx.fillStyle = fill;
        ctx.textBaseline = "middle";

        ctx.clearRect(0, 0, w, h);
        ctx.fillText(text, padding, h / 2);
        // ctx.fillText(text, 0, h / 2);

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

                    const top0 = piecewiseQuadPoint(
                        top.p0,
                        top.mid,
                        top.p2,
                        top.h1,
                        top.h2,
                        t0
                    );
                    const top1 = piecewiseQuadPoint(
                        top.p0,
                        top.mid,
                        top.p2,
                        top.h1,
                        top.h2,
                        t1
                    );
                    const bot0 = piecewiseQuadPoint(
                        bottom.p0,
                        bottom.mid,
                        bottom.p2,
                        bottom.h1,
                        bottom.h2,
                        t0
                    );
                    const bot1 = piecewiseQuadPoint(
                        bottom.p0,
                        bottom.mid,
                        bottom.p2,
                        bottom.h1,
                        bottom.h2,
                        t1
                    );

                    // vectors for affine approx
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
