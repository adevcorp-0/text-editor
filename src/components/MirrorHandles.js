import React, { useState } from "react";
import { Stage, Layer, Line, Circle } from "react-konva";

export default function MirrorHandles() {
    const [points, setPoints] = useState({
        left: { x: 100, y: 300 },
        mid: { x: 300, y: 300 },
        right: { x: 500, y: 300 },
        handle1: { x: 200, y: 300 }, // controls curve left→mid
        handle2: { x: 400, y: 300 }, // controls curve mid→right
    });

    const handleDrag = (key, e) => {
        const newPoints = { ...points };
        newPoints[key] = { x: e.target.x(), y: e.target.y() };

        if (key === "mid") {
            // move both handles with mid point (keep offsets)
            const dx = newPoints.mid.x - points.mid.x;
            const dy = newPoints.mid.y - points.mid.y;
            newPoints.handle1 = {
                x: points.handle1.x + dx,
                y: points.handle1.y + dy,
            };
            newPoints.handle2 = {
                x: points.handle2.x + dx,
                y: points.handle2.y + dy,
            };
        }

        if (key === "handle1" || key === "handle2") {
            // compute vector from mid → dragged handle
            const dx = newPoints[key].x - newPoints.mid.x;
            const dy = newPoints[key].y - newPoints.mid.y;

            const length = Math.sqrt(dx * dx + dy * dy) || 1;
            const dirX = dx / length;
            const dirY = dy / length;

            // project the other handle onto the same line (keep its distance)
            if (key === "handle1") {
                const dist = Math.sqrt(
                    (points.handle2.x - points.mid.x) ** 2 +
                    (points.handle2.y - points.mid.y) ** 2
                );
                newPoints.handle2 = {
                    x: newPoints.mid.x - dirX * dist,
                    y: newPoints.mid.y - dirY * dist,
                };
            } else {
                const dist = Math.sqrt(
                    (points.handle1.x - points.mid.x) ** 2 +
                    (points.handle1.y - points.mid.y) ** 2
                );
                newPoints.handle1 = {
                    x: newPoints.mid.x - dirX * dist,
                    y: newPoints.mid.y - dirY * dist,
                };
            }
        }
        setPoints(newPoints);
    };

    // Quadratic Bezier approximation (for Konva Line)
    const getQuadraticPoints = (p1, p2, handle, segments = 40) => {
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

    const curveLeftMid = getQuadraticPoints(points.left, points.mid, points.handle1);
    const curveMidRight = getQuadraticPoints(points.mid, points.right, points.handle2);

    return (
        <Stage width={600} height={600}>
            <Layer>
                {/* Bezier curves */}
                <Line
                    points={[...curveLeftMid, ...curveMidRight]}
                    stroke="blue"
                    strokeWidth={3}
                />

                {/* Orange guideline showing mid+handles alignment */}
                <Line
                    points={[
                        points.handle1.x, points.handle1.y,
                        points.mid.x, points.mid.y,
                        points.handle2.x, points.handle2.y
                    ]}
                    stroke="orange"
                    dash={[4, 4]}
                />

                {/* Draggable points */}
                {Object.entries(points).map(([key, pt]) => (
                    <Circle
                        key={key}
                        x={pt.x}
                        y={pt.y}
                        radius={6}
                        fill={key.includes("handle") ? "orange" : "cyan"}
                        draggable
                        onDragMove={(e) => handleDrag(key, e)}
                    />
                ))}
            </Layer>
        </Stage>
    );
}
