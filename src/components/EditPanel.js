import { useSelector } from "react-redux";
import React, { useState, useEffect, useRef } from "react";
import { Stage, Layer, Text, Line, Circle } from "react-konva";

export default function EditPanel() {
    const { defaultText } = useSelector((state) => state.editor);
    const textRef = useRef(null);

    const [textProps, setTextProps] = useState({
        x: 200,
        y: 200,
        width: 300,
        height: 80,
        fontSize: 32,
    });

    const [points, setPoints] = useState(null);

    useEffect(() => {
        console.log(defaultText);
        setTimeout(() => {
            if (textRef.current) {
                const box = textRef.current.getClientRect();
                setTextProps((prev) => ({
                    ...prev,
                    width: box.width,
                    height: box.height,
                }));

                const offsetX = textProps.x;
                const offsetY = textProps.y;
                const w = box.width;
                const h = box.height;

                // Only set once (or when text changes)
                if (!points) {
                    setPoints({
                        tl: { x: offsetX, y: offsetY },
                        tr: { x: offsetX + w, y: offsetY },
                        bl: { x: offsetX, y: offsetY + h },
                        br: { x: offsetX + w, y: offsetY + h },

                        topMid: { x: offsetX + w / 2, y: offsetY },
                        topHandle1: { x: offsetX + w / 4, y: offsetY },
                        topHandle2: { x: offsetX + (3 * w) / 4, y: offsetY },

                        bottomMid: { x: offsetX + w / 2, y: offsetY + h },
                        bottomHandle1: { x: offsetX + w / 4, y: offsetY + h },
                        bottomHandle2: { x: offsetX + (3 * w) / 4, y: offsetY + h },
                    });
                }
            }
        }, 0);
    }, [defaultText, textProps.fontSize]);

    const handleDrag = (key, e) => {
        setPoints((prev) => ({
            ...prev,
            [key]: { x: e.target.x(), y: e.target.y() },
        }));
    };

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

    // if (!points) return null;
    if (!points) return <div>Loading...</div>;
    const topCurve = [
        ...getQuadraticPoints(points.tl, points.topMid, points.topHandle1),
        ...getQuadraticPoints(points.topMid, points.tr, points.topHandle2),
    ];

    const bottomCurve = [
        ...getQuadraticPoints(points.bl, points.bottomMid, points.bottomHandle1),
        ...getQuadraticPoints(points.bottomMid, points.br, points.bottomHandle2),
    ];

    return (
        <div className="flex justify-center items-center">
            <Stage width={735} height={735} className="bg-white rounded-lg shadow-lg">
                <Layer>
                    {/* Text */}
                    <Text
                        ref={textRef}
                        x={textProps.x}
                        y={textProps.y}
                        text={defaultText}
                        fontSize={36}
                        fill="white"
                    />

                    <Line points={topCurve} stroke="#4ab3ff" strokeWidth={1} />
                    <Line points={bottomCurve} stroke="#4ab3ff" strokeWidth={1} />

                    <Line
                        points={[points.tl.x, points.tl.y, points.bl.x, points.bl.y]}
                        stroke="#4ab3ff"
                        strokeWidth={1}
                    />
                    <Line
                        points={[points.tr.x, points.tr.y, points.br.x, points.br.y]}
                        stroke="#4ab3ff"
                        strokeWidth={1}
                    />

                    {Object.entries(points).map(([key, pt]) => (
                        <Circle
                            key={key}
                            x={pt.x}
                            y={pt.y}
                            radius={4}
                            fill={key.includes("Handle") ? "orange" : "cyan"}
                            stroke="#4ea7e5"
                            strokeWidth={0.5}
                            draggable
                            onDragMove={(e) => handleDrag(key, e)}
                        />
                    ))}
                </Layer>
            </Stage>
        </div>
    );
};
