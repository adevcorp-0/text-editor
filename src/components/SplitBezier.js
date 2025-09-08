import React, { useState } from "react";
import { Stage, Layer, Line, Circle } from "react-konva";

export default function SplitBezier() {
    const [points, setPoints] = useState({
        left: { x: 100, y: 300 },
        mid: { x: 300, y: 300 },
        right: { x: 500, y: 300 },
        leftExtra: { x: 200, y: 300 },
        rightExtra: { x: 400, y: 300 },
    });

    const handleDrag = (key, e) => {
        let newPoints = { ...points };

        if (key === "mid") {
            const dxL = points.leftExtra.x - points.mid.x;
            const dyL = points.leftExtra.y - points.mid.y;
            const dxR = points.rightExtra.x - points.mid.x;
            const dyR = points.rightExtra.y - points.mid.y;

            newPoints.mid = { x: e.target.x(), y: e.target.y() };
            newPoints.leftExtra = { x: newPoints.mid.x + dxL, y: newPoints.mid.y + dyL };
            newPoints.rightExtra = { x: newPoints.mid.x + dxR, y: newPoints.mid.y + dyR };
        } else if (key === "leftExtra" || key === "rightExtra") {
            const mid = points.mid;
            const mx = e.target.x() - mid.x;
            const my = e.target.y() - mid.y;
            const len = Math.sqrt(mx * mx + my * my);

            if (len > 0) {
                const dirX = mx / len;
                const dirY = my / len;
                newPoints[key] = {
                    x: mid.x + mx,
                    y: mid.y + my,
                };
            }
        } else {
            newPoints[key] = { x: e.target.x(), y: e.target.y() };
        }

        setPoints(newPoints);
    };

    const getQuadraticPoints = (p1, p2, handle, segments = 30) => {
        const pts = [];
        for (let t = 0; t <= 1; t += 1 / segments) {
            const x =
                (1 - t) * (1 - t) * p1.x +
                2 * (1 - t) * t * handle.x +
                t * t * p2.x;
            const y =
                (1 - t) * (1 - t) * p1.y +
                2 * (1 - t) * t * handle.y +
                t * t * p2.y;
            pts.push(x, y);
        }
        return pts;
    };

    const curveLeftMid = getQuadraticPoints(points.left, points.mid, points.leftExtra);
    const curveMidRight = getQuadraticPoints(points.mid, points.right, points.rightExtra);

    return (
        <Stage width={600} height={600}>
            <Layer>
                <Line
                    points={[...curveLeftMid, ...curveMidRight]}
                    stroke="blue"
                    strokeWidth={3}
                />
                <Line
                    points={[
                        points.leftExtra.x,
                        points.leftExtra.y,
                        points.mid.x,
                        points.mid.y,
                        points.rightExtra.x,
                        points.rightExtra.y,
                    ]}
                    stroke="orange"
                    dash={[4, 4]}
                />
                {Object.entries(points).map(([key, pt]) => (
                    <Circle
                        key={key}
                        x={pt.x}
                        y={pt.y}
                        radius={6}
                        fill={
                            key === "mid" ? "cyan" : key.includes("Extra") ? "orange" : "green"
                        }
                        draggable
                        onDragMove={(e) => handleDrag(key, e)}
                    />
                ))}
            </Layer>
        </Stage>
    );
}
