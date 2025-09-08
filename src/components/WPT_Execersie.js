import React, { useEffect, useMemo, useRef, useState } from "react";
import Konva from "konva";
import { Stage, Layer, Line, Circle, Shape } from "react-konva";
import piecewiseQuadPoint from "../helpers/bezier";
import WarpComponent from "./WarpComponent";

function measureText({ text, fontFamily, fontSize }) {
    const dummy = new Konva.Text({
        text,
        fontFamily,
        fontSize
    });
    return {
        width: dummy.width(),
        height: dummy.height()
    }
}

export default function WarpedTextEditor_Execersize() {
    const [textTypo, setTextTypo] = useState({
        text: "Hello this is my life.",
        fontFamily: "Robert, system-ui, Arial",
        fontSize: 150,
    })
    const { width, height } = measureText(textTypo);
    const paddingX = 0;
    const paddingY = 0;
    const [pts, setPts] = useState({
        left: { x: 100, y: 200 },
        mid: { x: 100 + width / 2 + paddingX, y: 200 },
        right: { x: 100 + width + paddingX * 2, y: 200 },

        h1: { x: 100 + width / 4, y: 200 },
        h2: { x: 100 + (width * 3) / 4, y: 200 },

        leftB: { x: 100, y: 200 + height + paddingY },
        midB: { x: 100 + width / 2 + paddingX, y: 200 + height + paddingY },
        rightB: { x: 100 + width + paddingX * 2, y: 200 + height + paddingY },

        b1: { x: 100 + width / 4, y: 200 + height + paddingY },
        b2: { x: 100 + (width * 3) / 4, y: 200 + height + paddingY },
    });
    const onDrag = (key, e) => {
        const np = { ...pts, [key]: { x: e.target.x(), y: e.target.y() } };
        const mirrorHandle = (dragKey, otherKey, midKey) => {
            const dx = np[dragKey].x - np[midKey].x;
            const dy = np[dragKey].y - np[midKey].y;
            const length = Math.sqrt(dx * dx + dy * dy) || 1;
            const dirX = dx / length;
            const dirY = dy / length;
            const dist = Math.sqrt(
                (pts[otherKey].x - pts[midKey].x) ** 2 +
                (pts[otherKey].y - pts[midKey].y) ** 2
            );

            np[otherKey] = {
                x: np[midKey].x - dirX * dist,
                y: np[midKey].y - dirY * dist,
            };
        };
        // if mid moves, shift both handles
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

        // enforce mirror
        if (key === "h1") mirrorHandle("h1", "h2", "mid");
        if (key === "h2") mirrorHandle("h2", "h1", "mid");
        if (key === "b1") mirrorHandle("b1", "b2", "midB");
        if (key === "b2") mirrorHandle("b2", "b1", "midB");

        setPts(np);
    };

    const DISP_SEG = 140;
    const topLinePts = useMemo(() => {
        const arr = [];
        for (let i = 0; i <= DISP_SEG; i++) {
            const t = i / DISP_SEG;
            const p = piecewiseQuadPoint(
                pts.left,
                pts.mid,
                pts.right,
                pts.h1,
                pts.h2,
                t
            );
            arr.push(p.x, p.y);
        }
        return arr;
    }, [pts]);

    const bottomLinePts = useMemo(() => {
        const arr = [];
        for (let i = 0; i <= DISP_SEG; i++) {
            const t = i / DISP_SEG;
            const p = piecewiseQuadPoint(
                pts.leftB,
                pts.midB,
                pts.rightB,
                pts.b1,
                pts.b2,
                t
            );
            arr.push(p.x, p.y);
        }
        return arr;
    }, [pts]);

    const top = useMemo(
        () => ({
            p0: pts.left,
            mid: pts.mid,
            p2: pts.right,
            h1: pts.h1,
            h2: pts.h2,
        }),
        [pts]
    );
    const bottom = useMemo(
        () => ({
            p0: pts.leftB,
            mid: pts.midB,
            p2: pts.rightB,
            h1: pts.b1,
            h2: pts.b2,
        }),
        [pts]
    );

    useEffect(() => {
        const { width, height } = measureText(textTypo);
        console.log("======= width ============")
        console.log(width, height)
        console.log(pts.left, pts.right)
        console.log("======= height ============")
        setPts({
            left: { x: 100, y: 200 },
            mid: { x: 100 + width / 2, y: 200 },
            right: { x: 100 + width, y: 200 },

            h1: { x: 100 + width / 4, y: 200 },
            h2: { x: 100 + (width * 3) / 4, y: 200 },

            leftB: { x: 100, y: 200 + height },
            midB: { x: 100 + width / 2, y: 200 + height },
            rightB: { x: 100 + width, y: 200 + height },

            b1: { x: 100 + width / 4, y: 200 + height },
            b2: { x: 100 + (width * 3) / 4, y: 200 + height },
        });
    }, [textTypo]);

    return (
        <Stage width={735} height={735} className="bg-white">
            <Layer>
                {/* warped text */}
                <WarpComponent
                    text={textTypo.text}
                    fontFamily={textTypo.fontFamily}
                    fontSize={textTypo.fontSize}
                    fill="#111"
                    top={top}
                    bottom={bottom}
                    sliceCount={180}
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

                {/* connector lines */}
                <Line
                    points={[pts.h1.x, pts.h1.y, pts.mid.x, pts.mid.y, pts.h2.x, pts.h2.y]}
                    stroke="#4ab3ff"
                    strokeWidth={1}
                />
                <Line
                    points={[pts.b1.x, pts.b1.y, pts.midB.x, pts.midB.y, pts.b2.x, pts.b2.y]}
                    stroke="#4ab3ff"
                    strokeWidth={1}
                />

                {/* draggable points */}
                {Object.entries(pts).map(([k, p]) => (
                    <Circle
                        key={k}
                        x={p.x}
                        y={p.y}
                        radius={5}
                        fill={"#fff"}
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
