import React, { useState } from "react";
import { Stage, Layer, Line, Circle } from "react-konva";

export default function MirrorHandlesRect() {
    const [points, setPoints] = useState({
        left: { x: 100, y: 200 },
        mid: { x: 300, y: 200 },
        right: { x: 500, y: 200 },
        handle1: { x: 200, y: 200 },
        handle2: { x: 400, y: 200 },

        leftBottom: { x: 100, y: 280 },
        midBottom: { x: 300, y: 280 },
        rightBottom: { x: 500, y: 280 },
        handleB1: { x: 200, y: 280 },
        handleB2: { x: 400, y: 280 },
    });

    const handleDrag = (key, e) => {
        const newPoints = { ...points };
        newPoints[key] = { x: e.target.x(), y: e.target.y() };

        const mirrorHandle = (handleKey, otherHandleKey, midKey) => {
            const dx = newPoints[handleKey].x - newPoints[midKey].x;
            const dy = newPoints[handleKey].y - newPoints[midKey].y;

            const length = Math.sqrt(dx * dx + dy * dy) || 1;
            const dirX = dx / length;
            const dirY = dy / length;

            const dist = Math.sqrt(
                (points[otherHandleKey].x - points[midKey].x) ** 2 +
                (points[otherHandleKey].y - points[midKey].y) ** 2
            );

            newPoints[otherHandleKey] = {
                x: newPoints[midKey].x - dirX * dist,
                y: newPoints[midKey].y - dirY * dist,
            };
        };

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
        if (key === "handle1") mirrorHandle("handle1", "handle2", "mid");
        if (key === "handle2") mirrorHandle("handle2", "handle1", "mid");

        if (key === "midBottom") {
            const dx = newPoints.midBottom.x - points.midBottom.x;
            const dy = newPoints.midBottom.y - points.midBottom.y;
            newPoints.handleB1 = {
                x: points.handleB1.x + dx,
                y: points.handleB1.y + dy,
            };
            newPoints.handleB2 = {
                x: points.handleB2.x + dx,
                y: points.handleB2.y + dy,
            };
        }
        if (key === "handleB1") mirrorHandle("handleB1", "handleB2", "midBottom");
        if (key === "handleB2") mirrorHandle("handleB2", "handleB1", "midBottom");

        setPoints(newPoints);
    };
    const getQuadraticPoints = (p1, p2, handle, segments = 400) => {
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

    const curveTop = [
        ...getQuadraticPoints(points.left, points.mid, points.handle1),
        ...getQuadraticPoints(points.mid, points.right, points.handle2),
    ];

    const curveBottom = [
        ...getQuadraticPoints(points.leftBottom, points.midBottom, points.handleB1),
        ...getQuadraticPoints(points.midBottom, points.rightBottom, points.handleB2),
    ];

    return (
        <Stage width={1000} height={1000} className="bg-white">
            <Layer>
                <Line points={curveTop} stroke="#4ab3ff" strokeWidth={1} />
                <Line points={curveBottom} stroke="#4ab3ff" strokeWidth={1} />
                <Line
                    points={[points.left.x, points.left.y, points.leftBottom.x, points.leftBottom.y]}
                    stroke="#4ab3ff"
                    strokeWidth={1}
                />
                <Line
                    points={[points.right.x, points.right.y, points.rightBottom.x, points.rightBottom.y]}
                    stroke="#4ab3ff"
                    strokeWidth={1}
                />
                <Line
                    points={[
                        points.handle1.x, points.handle1.y,
                        points.mid.x, points.mid.y,
                        points.handle2.x, points.handle2.y
                    ]}
                    stroke="#4ab3ff"
                    strokeWidth={1}
                />
                <Line
                    points={[
                        points.handleB1.x, points.handleB1.y,
                        points.midBottom.x, points.midBottom.y,
                        points.handleB2.x, points.handleB2.y
                    ]}
                    stroke="#4ab3ff"
                    strokeWidth={1}
                />
                {Object.entries(points).map(([key, pt]) => (
                    <Circle
                        key={key}
                        x={pt.x}
                        y={pt.y}
                        radius={4}
                        fill="#fff"
                        stroke="#4ab3ff"
                        strokeWidth={1}
                        draggable
                        onDragMove={(e) => handleDrag(key, e)}
                    />
                ))}
            </Layer>
        </Stage>
    );
}
