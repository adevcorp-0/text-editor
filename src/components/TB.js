import React, { useEffect, useMemo, useRef, useState } from "react";
import Konva from "konva";
import { Stage, Layer, Line, Circle, Group, Rect } from "react-konva";
import piecewiseQuadPoint from "../helpers/bezier";
import WarpComponent from "./WarpComponent";

function measureText({ text, fontFamily, fontSize }) {
    const dummy = new Konva.Text({
        text,
        fontFamily,
        fontSize,
    });
    return {
        width: dummy.width(),
        height: dummy.height(),
    };
}

export default function WarpedTextEditor_Execersize() {
    const [textTypo, setTextTypo] = useState({
        text: "Hello.",
        fontFamily: "Robert, system-ui, Arial",
        fontSize: 150,
    });
    const [isEditing, setIsEditing] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [hasBeenEdited, setHasBeenEdited] = useState(false);
    const inputRef = useRef(null);
    const [groupPosition, setGroupPosition] = useState({ x: 0, y: 0 });

    const [pts, setPts] = useState({
        left: { x: 100, y: 200 },
        mid: { x: 300, y: 200 },
        right: { x: 500, y: 200 },

        h1: { x: 200, y: 200 },
        h2: { x: 400, y: 200 },

        leftB: { x: 100, y: 320 },
        midB: { x: 300, y: 320 },
        rightB: { x: 500, y: 320 },

        b1: { x: 200, y: 320 },
        b2: { x: 400, y: 320 },
    });

    const { width, height } = measureText(textTypo);

    const onDrag = (key, e) => {
        const np = { ...pts, [key]: { x: e.target.x(), y: e.target.y() } };

        if (hasBeenEdited) {
            setPts(np);
        } else {
            const mirrorHandle = (dragKey, otherKey, midKey) => {
                const dx = np[dragKey].x - np[midKey].x;
                const dy = np[dragKey].y - np[midKey].y;
                const length = Math.sqrt(dx * dx + dy * dy) || 1;
                const dirX = dx / length;
                const dirY = dy / length;
                const dist = Math.sqrt(
                    (pts[otherKey].x - pts[midKey].x) ** 2 +
                    (pts[otherKey].y - np[midKey].y) ** 2
                );

                np[otherKey] = {
                    x: np[midKey].x - dirX * dist,
                    y: np[midKey].y - dirY * dist,
                };
            };

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

            if (key === "h1") mirrorHandle("h1", "h2", "mid");
            if (key === "h2") mirrorHandle("h2", "h1", "mid");
            if (key === "b1") mirrorHandle("b1", "b2", "midB");
            if (key === "b2") mirrorHandle("b2", "b1", "midB");

            setPts(np);
        }
    };

    const handleTextDoubleClick = (e) => {
        e.cancelBubble = true;
        setIsEditing(true);
        setInputValue(textTypo.text);
    };

    const handleTextClick = (e) => {
        e.cancelBubble = true;
    };

    const handleInputChange = (e) => setInputValue(e.target.value);

    const handleInputKeyDown = (e) => {
        if (e.key === "Enter") {
            handleTextUpdate();
        } else if (e.key === "Escape") {
            setIsEditing(false);
            setInputValue(textTypo.text);
        }
    };

    const handleTextUpdate = () => {
        if (inputValue.trim() !== "") {
            setTextTypo((prev) => ({ ...prev, text: inputValue.trim() }));
            setHasBeenEdited(true);
        }
        setIsEditing(false);
    };

    const handleStageClick = (e) => {
        if (isEditing && e.target === e.target.getStage()) {
            handleTextUpdate();
        }
    };

    const handleGroupDragMove = (e) => {
        setGroupPosition({ x: e.target.x(), y: e.target.y() });
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

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    return (
        <div style={{ position: "relative" }}>
            <Stage width={735} height={735} className="bg-white" onClick={handleStageClick}>
                <Layer>
                    {/* ✅ Group makes text + handles draggable together */}
                    <Group 
                        draggable={!isEditing}
                        onDragMove={handleGroupDragMove}
                    >
                        {!isEditing && (
                            <>
                                <WarpComponent
                                    text={textTypo.text}
                                    fontFamily={textTypo.fontFamily}
                                    fontSize={textTypo.fontSize}
                                    fill="#111"
                                    top={top}
                                    bottom={bottom}
                                    sliceCount={180}
                                    parentX={groupPosition.x}
                                    parentY={groupPosition.y}
                                />
                            </>
                        )}

                        {!isEditing && !hasBeenEdited && (
                            <Rect
                                x={pts.left.x}
                                y={pts.left.y - textTypo.fontSize * 0.5}
                                width={pts.right.x - pts.left.x}
                                height={pts.leftB.y - pts.left.y + textTypo.fontSize * 0.5}
                                fill="transparent"
                                onClick={handleTextClick}
                                onDblClick={handleTextDoubleClick}
                                listening={true}
                            />
                        )}
                        {!isEditing && (
                            <>
                                {!hasBeenEdited ? (
                                    <>
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
                                    </>
                                ) : (
                                    <>
                                        <Line
                                            points={[
                                                pts.left.x,
                                                pts.left.y,
                                                pts.right.x,
                                                pts.right.y,
                                                pts.rightB.x,
                                                pts.rightB.y,
                                                pts.leftB.x,
                                                pts.leftB.y,
                                                pts.left.x,
                                                pts.left.y,
                                            ]}
                                            stroke="#4ab3ff"
                                            strokeWidth={1}
                                            closed={true}
                                        />
                                        {["left", "right", "leftB", "rightB"].map((k) => (
                                            <Circle
                                                key={k}
                                                x={pts[k].x}
                                                y={pts[k].y}
                                                radius={5}
                                                fill={"#fff"}
                                                stroke="#4ab3ff"
                                                strokeWidth={1}
                                                draggable={false}
                                                listening={false}
                                            />
                                        ))}
                                    </>
                                )}
                            </>
                        )}
                    </Group>
                </Layer>
            </Stage>

            {isEditing && (
                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleInputKeyDown}
                    onBlur={handleTextUpdate}
                    style={{
                        position: "absolute",
                        left: pts.left.x,
                        top: pts.left.y - textTypo.fontSize * 0.5,
                        fontSize: textTypo.fontSize,
                        fontFamily: textTypo.fontFamily,
                        color: "#111",
                        background: "transparent",
                        border: "2px solid #4ab3ff",
                        outline: "none",
                        padding: "0px",
                        margin: "0px",
                        width: `${pts.right.x - pts.left.x}px`,
                        height: `${textTypo.fontSize}px`,
                        lineHeight: `${textTypo.fontSize}px`,
                        verticalAlign: "top",
                        zIndex: 1000,
                    }}
                />
            )}
        </div>
    );
}
