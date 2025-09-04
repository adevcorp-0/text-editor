import React, { useState } from "react";
import { Stage, Layer, Line, Circle } from "react-konva";

export default function BezierHandles() {
    const [points, setPoints] = useState({
        left: { x: 100, y: 300 },
        mid: { x: 300, y: 300 },
        right: { x: 500, y: 300 },
        handle1: { x: 300, y: 200 }, // top handle
        handle2: { x: 300, y: 400 }, // bottom handle
    });

    const handleDrag = (key, e) => {
        const newPoints = { ...points };
        newPoints[key] = { x: e.target.x(), y: e.target.y() };

        if (key === "mid") {
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
            const dx = newPoints[key].x - newPoints.mid.x;
            const dy = newPoints[key].y - newPoints.mid.y;
            const length = Math.sqrt(dx * dx + dy * dy) || 1;
            const dirX = dx / length;
            const dirY = dy / length;

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

    return (
        <Stage width={600} height={600}>
            <Layer>
                {/* Bezier curve using the two handles */}
                <Line
                    points={[
                        points.left.x,
                        points.left.y,
                        points.handle1.x,
                        points.handle1.y,
                        points.handle2.x,
                        points.handle2.y,
                        points.right.x,
                        points.right.y,
                    ]}
                    stroke="blue"
                    strokeWidth={3}
                    bezier
                />

                {/* Guide line for handles */}
                <Line
                    points={[
                        points.handle1.x,
                        points.handle1.y,
                        points.mid.x,
                        points.mid.y,
                        points.handle2.x,
                        points.handle2.y,
                    ]}
                    stroke="red"
                    strokeWidth={1}
                    dash={[5, 5]}
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
