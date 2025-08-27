import { useSelector } from "react-redux";
import React, { useState, useEffect, useRef } from "react";
import { Stage, Layer, Rect, Text, Line, Circle, Group } from "react-konva";

export const EditPanel = () => {
    const { selectedStyle, defaultText } = useSelector((state) => state.editor);
    const textRef = useRef(null);
    const [textProps, setTextProps] = useState({
        x: 200,
        y: 200,
        width: 0,
        height: 0,
        text: "Hello World",
        fontSize: 32,
    });
    const [controlPoints, setControlPoints] = useState([]);

    useEffect(() => {
        if (textRef.current) {
            const box = textRef.current.getClientRect();
            setTextProps((prev) => ({
                ...prev,
                width: box.width,
                height: box.height,
            }));
            if (!controlPoints.some((p) => p.dragged)) {
                const offsetX = textProps.x;
                const offsetY = textProps.y;

                setControlPoints([
                    { key: "tl", x: offsetX, y: offsetY, dragged: false },
                    { key: "top-left-handle", x: offsetX + box.width / 4, y: offsetY, dragged: false },
                    { key: "top-mid", x: offsetX + box.width / 2, y: offsetY, dragged: false },
                    { key: "top-right-handle", x: offsetX + (3 * box.width) / 4, y: offsetY, dragged: false },
                    { key: "tr", x: offsetX + box.width, y: offsetY, dragged: false },
                    { key: "br", x: offsetX + box.width, y: offsetY + box.height, dragged: false },
                    { key: "bottom-right-handle", x: offsetX + (3 * box.width) / 4, y: offsetY + box.height, dragged: false },
                    { key: "bottom-mid", x: offsetX + box.width / 2, y: offsetY + box.height, dragged: false },
                    { key: "bottom-left-handle", x: offsetX + box.width / 4, y: offsetY + box.height, dragged: false },
                    { key: "bl", x: offsetX, y: offsetY + box.height, dragged: false },
                ]);

            }

        }
    }, [defaultText, textProps.fontSize])
    const handlePointDrag = (idx, e) => {
        const newPoints = [...controlPoints];
        newPoints[idx] = { ...newPoints[idx], x: e.target.x(), y: e.target.y() };
        setControlPoints(newPoints);
    };
    const linePoints = controlPoints.flatMap((pt) => [pt.x, pt.y]);

    // stroke="#4ea7e5"
    return (
        <>
            <div className="flex justify-center items-center">
                <Stage width={735} height={735} className="bg-white rounded-lg shadow-lg">
                    <Layer>
                        {/* <Group
                            x={textProps.x}
                            y={textProps.y}
                            // draggable
                            onDragMove={(e) => {
                                setTextProps((prev) => ({
                                    ...prev,
                                    x: e.target.x(),
                                    y: e.target.y(),
                                }));
                            }}
                        > */}
                        <Text
                            ref={textRef}
                            x={textProps.x}
                            y={textProps.y}
                            text={defaultText}
                            fontSize={textProps.fontSize}
                            fill="black"
                            strokeWidth={0.5}
                        />
                        <Line
                            points={linePoints}
                            stroke="cyan"
                            strokeWidth={1}
                            closed
                        />
                        {controlPoints.map((pt, idx) => (
                            <Circle
                                key={pt.key}
                                x={pt.x}
                                y={pt.y}
                                radius={4}
                                fill="#fff"
                                stroke="#4ea7e5"
                                strokeWidth={0.5}
                                draggable
                                // onDragMove={(e) => {
                                //     console.log(pt.key, e.target.x(), e.target.y());
                                // }}
                                onDragMove={(e) => handlePointDrag(idx, e)}
                            />
                        ))}
                        {/* </Group> */}
                    </Layer>
                </Stage>
            </div>
        </>
    )
}
