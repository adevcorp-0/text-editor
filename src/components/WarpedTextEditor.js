import React, { useEffect, useMemo, useRef, useState } from "react";
import Konva from "konva";
import { Stage, Layer, Line, Circle, Group, Rect } from "react-konva";
import piecewiseQuadPoint from "../helpers/bezier";
import WarpComponent from "./pr";

function measureText({ text, fontFamily, fontSize }) {
    const dummy = new Konva.Text({ text, fontFamily, fontSize });
    return { width: dummy.width(), height: dummy.height() };
}

export default function WarpedTextEditor_Exercise() {
    const [textTypo, setTextTypo] = useState({
        text: "Hello.",
        fontFamily: "Robert, system-ui, Arial",
        fontSize: 150,
    });

    const [isEditing, setIsEditing] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [hasBeenEdited, setHasBeenEdited] = useState(false);
    const [preservedPts, setPreservedPts] = useState(null);
    const [rectBounds, setRectBounds] = useState({ left: 0, right: 0, top: 0, bottom: 0 });
    const inputRef = useRef(null);

    const [groupPos, setGroupPos] = useState({ x: 100, y: 200 });
    const { width, height } = useMemo(() => measureText(textTypo), [textTypo]);
    const [pts, setPts] = useState({
        left: { x: 0, y: 0 },
        mid: { x: 0, y: 0 },
        right: { x: 0, y: 0 },

        h1: { x: 0, y: 0 },
        h2: { x: 0, y: 0 },

        leftB: { x: 0, y: 0 },
        midB: { x: 0, y: 0 },
        rightB: { x: 0, y: 0 },

        b1: { x: 0, y: 0 },
        b2: { x: 0, y: 0 },
    });

    useEffect(() => {
        if (preservedPts) {
            const scaleX = width / (preservedPts.right.x - preservedPts.left.x);
            const scaleY = height / (preservedPts.leftB.y - preservedPts.left.y);

            setPts({
                left: { x: 0, y: 0 },
                mid: {
                    x: (preservedPts.mid.x - preservedPts.left.x) * scaleX,
                    y: (preservedPts.mid.y - preservedPts.left.y) * scaleY
                },
                right: { x: width, y: 0 },

                h1: {
                    x: (preservedPts.h1.x - preservedPts.left.x) * scaleX,
                    y: (preservedPts.h1.y - preservedPts.left.y) * scaleY
                },
                h2: {
                    x: (preservedPts.h2.x - preservedPts.left.x) * scaleX,
                    y: (preservedPts.h2.y - preservedPts.left.y) * scaleY
                },

                leftB: { x: 0, y: height },
                midB: {
                    x: (preservedPts.midB.x - preservedPts.left.x) * scaleX,
                    y: height + (preservedPts.midB.y - preservedPts.leftB.y) * scaleY
                },
                rightB: { x: width, y: height },

                b1: {
                    x: (preservedPts.b1.x - preservedPts.left.x) * scaleX,
                    y: height + (preservedPts.b1.y - preservedPts.leftB.y) * scaleY
                },
                b2: {
                    x: (preservedPts.b2.x - preservedPts.left.x) * scaleX,
                    y: height + (preservedPts.b2.y - preservedPts.leftB.y) * scaleY
                },
            });
        } else {
            setPts({
                left: { x: 0, y: 0 },
                mid: { x: width / 2, y: 0 },
                right: { x: width, y: 0 },

                h1: { x: width / 4, y: 0 },
                h2: { x: (width * 3) / 4, y: 0 },

                leftB: { x: 0, y: height },
                midB: { x: width / 2, y: height },
                rightB: { x: width, y: height },

                b1: { x: width / 4, y: height },
                b2: { x: (width * 3) / 4, y: height },
            });
        }

        // Initialize rectangular bounds
        setRectBounds({
            left: 0,
            right: width,
            top: 0,
            bottom: height
        });
    }, [width, height, preservedPts]);

    const onDrag = (key, e) => {
        if (hasBeenEdited && !["left", "right", "leftB", "rightB"].includes(key)) {
            return;
        }

        if (!hasBeenEdited) {
            const np = { ...pts, [key]: { x: e.target.x(), y: e.target.y() } };
            const applyMirror = (dragKey, otherKey, midKey) => {
                const dx = np[dragKey].x - np[midKey].x;
                const dy = np[dragKey].y - np[midKey].y;
                const length = Math.hypot(dx, dy) || 1;
                const dist = Math.hypot(pts[otherKey].x - pts[midKey].x, pts[otherKey].y - pts[midKey].y);

                np[otherKey] = {
                    x: np[midKey].x - (dx / length) * dist,
                    y: np[midKey].y - (dy / length) * dist,
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
            if (key === "h1") applyMirror("h1", "h2", "mid");
            if (key === "h2") applyMirror("h2", "h1", "mid");
            if (key === "b1") applyMirror("b1", "b2", "midB");
            if (key === "b2") applyMirror("b2", "b1", "midB");

            setPts(np);
        } else {
            const newRectBounds = { ...rectBounds };
            if (key === "left") {
                newRectBounds.left = e.target.x();
                newRectBounds.top = e.target.y();
            } else if (key === "right") {
                newRectBounds.right = e.target.x();
                newRectBounds.top = e.target.y();
            } else if (key === "leftB") {
                newRectBounds.left = e.target.x();
                newRectBounds.bottom = e.target.y();
            } else if (key === "rightB") {
                newRectBounds.right = e.target.x();
                newRectBounds.bottom = e.target.y();
            }

            const scaleX = (newRectBounds.right - newRectBounds.left) / (rectBounds.right - rectBounds.left);
            const scaleY = (newRectBounds.bottom - newRectBounds.top) / (rectBounds.bottom - rectBounds.top);

            const newPts = { ...pts };

            const originalWidth = rectBounds.right - rectBounds.left;
            const originalHeight = rectBounds.bottom - rectBounds.top;
            const newWidth = newRectBounds.right - newRectBounds.left;
            const newHeight = newRectBounds.bottom - newRectBounds.top;

            Object.keys(newPts).forEach(key => {
                if (key !== 'left' && key !== 'right' && key !== 'leftB' && key !== 'rightB') {
                    const originalPoint = pts[key];
                    const relX = (originalPoint.x - rectBounds.left) / originalWidth;
                    const relY = (originalPoint.y - rectBounds.top) / originalHeight;

                    newPts[key] = {
                        x: newRectBounds.left + relX * newWidth,
                        y: newRectBounds.top + relY * newHeight
                    };
                }
            });

            newPts.left = { x: newRectBounds.left, y: newRectBounds.top };
            newPts.right = { x: newRectBounds.right, y: newRectBounds.top };
            newPts.leftB = { x: newRectBounds.left, y: newRectBounds.bottom };
            newPts.rightB = { x: newRectBounds.right, y: newRectBounds.bottom };

            newRectBounds.left = newPts.left.x;
            newRectBounds.right = newPts.right.x;
            newRectBounds.top = newPts.left.y;
            newRectBounds.bottom = newPts.leftB.y;

            setRectBounds(newRectBounds);
            setPts(newPts);
        }
    };

    const handleTextDoubleClick = (e) => {
        e.cancelBubble = true;
        setIsEditing(true);
        setInputValue(textTypo.text);
    };

    const handleTextUpdate = () => {
        if (inputValue.trim() !== "") {
            if (!hasBeenEdited) {
                setPreservedPts({ ...pts });
            }
            setTextTypo((prev) => ({ ...prev, text: inputValue.trim() }));
            setHasBeenEdited(true);
            setGroupPos(prev => ({
                x: prev.x - 2,
                y: prev.y - 2
            }));
        }
        setIsEditing(false);
    };

    const cancelEditing = () => {
        setIsEditing(false);
        setInputValue(textTypo.text);
    };

    const handleInputKeyDown = (e) => {
        if (e.key === "Enter") handleTextUpdate();
        if (e.key === "Escape") cancelEditing();
    };

    const handleStageClick = (e) => {
        if (isEditing && e.target === e.target.getStage()) handleTextUpdate();
    };

    const DISP_SEG = 140;
    const topLinePts = useMemo(() => {
        const arr = [];
        for (let i = 0; i <= DISP_SEG; i++) {
            const t = i / DISP_SEG;
            const p = piecewiseQuadPoint(pts.left, pts.mid, pts.right, pts.h1, pts.h2, t);
            arr.push(p.x, p.y);
        }
        return arr;
    }, [pts]);

    const bottomLinePts = useMemo(() => {
        const arr = [];
        for (let i = 0; i <= DISP_SEG; i++) {
            const t = i / DISP_SEG;
            const p = piecewiseQuadPoint(pts.leftB, pts.midB, pts.rightB, pts.b1, pts.b2, t);
            arr.push(p.x, p.y);
        }
        return arr;
    }, [pts]);

    const top = useMemo(
        () => ({ p0: pts.left, mid: pts.mid, p2: pts.right, h1: pts.h1, h2: pts.h2 }),
        [pts]
    );
    const bottom = useMemo(
        () => ({ p0: pts.leftB, mid: pts.midB, p2: pts.rightB, h1: pts.b1, h2: pts.b2 }),
        [pts]
    );

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
                    <Group
                        x={groupPos.x}
                        y={groupPos.y}
                        draggable={!isEditing}
                        onDragStart={(e) => {
                            if (e.target !== e.target.getParent()) {
                                e.cancelBubble = true;
                                return false;
                            }
                        }}
                    >
                        {!isEditing && (
                            <WarpComponent
                                text={textTypo.text}
                                fontFamily={textTypo.fontFamily}
                                fontSize={hasBeenEdited ?
                                    textTypo.fontSize * ((rectBounds.right - rectBounds.left) / (pts.right.x - pts.left.x)) :
                                    textTypo.fontSize
                                }
                                fill="#111"
                                top={hasBeenEdited ? {
                                    p0: { x: rectBounds.left, y: rectBounds.top },
                                    mid: { x: (rectBounds.left + rectBounds.right) / 2, y: rectBounds.top },
                                    p2: { x: rectBounds.right, y: rectBounds.top },
                                    h1: { x: rectBounds.left + (pts.h1.x - pts.left.x) * ((rectBounds.right - rectBounds.left) / (pts.right.x - pts.left.x)), y: rectBounds.top + (pts.h1.y - pts.left.y) * ((rectBounds.bottom - rectBounds.top) / (pts.leftB.y - pts.left.y)) },
                                    h2: { x: rectBounds.left + (pts.h2.x - pts.left.x) * ((rectBounds.right - rectBounds.left) / (pts.right.x - pts.left.x)), y: rectBounds.top + (pts.h2.y - pts.left.y) * ((rectBounds.bottom - rectBounds.top) / (pts.leftB.y - pts.left.y)) }
                                } : top}
                                bottom={hasBeenEdited ? {
                                    p0: { x: rectBounds.left, y: rectBounds.bottom },
                                    mid: { x: (rectBounds.left + rectBounds.right) / 2, y: rectBounds.bottom },
                                    p2: { x: rectBounds.right, y: rectBounds.bottom },
                                    h1: { x: rectBounds.left + (pts.b1.x - pts.left.x) * ((rectBounds.right - rectBounds.left) / (pts.right.x - pts.left.x)), y: rectBounds.bottom + (pts.b1.y - pts.leftB.y) * ((rectBounds.bottom - rectBounds.top) / (pts.leftB.y - pts.left.y)) },
                                    h2: { x: rectBounds.left + (pts.b2.x - pts.left.x) * ((rectBounds.right - rectBounds.left) / (pts.right.x - pts.left.x)), y: rectBounds.bottom + (pts.b2.y - pts.leftB.y) * ((rectBounds.bottom - rectBounds.top) / (pts.leftB.y - pts.left.y)) }
                                } : bottom}
                                sliceCount={180}
                                draggable={false}
                            />
                        )}
                        {!isEditing && (
                            <Rect
                                x={hasBeenEdited ? rectBounds.left : Math.min(pts.left.x, pts.leftB.x)}
                                y={hasBeenEdited ? rectBounds.top - textTypo.fontSize * 0.5 : Math.min(pts.left.y, pts.leftB.y) - textTypo.fontSize * 0.5}
                                width={hasBeenEdited ? rectBounds.right - rectBounds.left : Math.max(pts.right.x, pts.rightB.x) - Math.min(pts.left.x, pts.leftB.x)}
                                height={hasBeenEdited ? rectBounds.bottom - rectBounds.top + textTypo.fontSize * 0.5 : Math.max(pts.leftB.y, pts.rightB.y) - Math.min(pts.left.y, pts.right.y) + textTypo.fontSize * 0.5}
                                fill="transparent"
                                onDblClick={(e) => {
                                    e.cancelBubble = true;
                                    handleTextDoubleClick(e);
                                }}
                                listening={true}
                                onClick={(e) => {
                                    e.cancelBubble = true;
                                }}
                            />
                        )}
                        {!isEditing && (
                            <>
                                {!hasBeenEdited ? (
                                    <>
                                        <Line points={topLinePts} stroke="#4ab3ff" strokeWidth={1} />
                                        <Line points={bottomLinePts} stroke="#4ab3ff" strokeWidth={1} />
                                        <Line points={[pts.left.x, pts.left.y, pts.leftB.x, pts.leftB.y]} stroke="#4ab3ff" />
                                        <Line points={[pts.right.x, pts.right.y, pts.rightB.x, pts.rightB.y]} stroke="#4ab3ff" />
                                        <Line points={[pts.h1.x, pts.h1.y, pts.mid.x, pts.mid.y, pts.h2.x, pts.h2.y]} stroke="#4ab3ff" />
                                        <Line points={[pts.b1.x, pts.b1.y, pts.midB.x, pts.midB.y, pts.b2.x, pts.b2.y]} stroke="#4ab3ff" />
                                        {Object.entries(pts).map(([k, p]) => (
                                            <Circle
                                                key={k}
                                                x={p.x}
                                                y={p.y}
                                                radius={5}
                                                fill="#fff"
                                                stroke="#4ab3ff"
                                                draggable
                                                onMouseDown={(e) => {
                                                    e.cancelBubble = true;
                                                }}
                                                onDragMove={(e) => onDrag(k, e)}
                                            />
                                        ))}
                                    </>
                                ) : (
                                    <>
                                        <Line points={topLinePts} stroke="#4ab3ff" strokeWidth={1} />
                                        <Line points={bottomLinePts} stroke="#4ab3ff" strokeWidth={1} />
                                        <Line points={[pts.left.x, pts.left.y, pts.leftB.x, pts.leftB.y]} stroke="#4ab3ff" />
                                        <Line points={[pts.right.x, pts.right.y, pts.rightB.x, pts.rightB.y]} stroke="#4ab3ff" />
                                        <Rect
                                            x={rectBounds.left}
                                            y={rectBounds.top}
                                            width={rectBounds.right - rectBounds.left}
                                            height={rectBounds.bottom - rectBounds.top}
                                            stroke="#4ab3ff"
                                            strokeWidth={2}
                                            fill="transparent"
                                            onDblClick={(e) => {
                                                e.cancelBubble = true;
                                                handleTextDoubleClick(e);
                                            }}
                                            listening={true}
                                            onClick={(e) => {
                                                e.cancelBubble = true;
                                            }}
                                        />
                                        <Circle
                                            x={rectBounds.left}
                                            y={rectBounds.top}
                                            radius={5}
                                            fill="#fff"
                                            stroke="#4ab3ff"
                                            draggable={true}
                                            onMouseDown={(e) => {
                                                e.cancelBubble = true;
                                            }}
                                            onDragMove={(e) => onDrag("left", e)}
                                            onDblClick={(e) => {
                                                e.cancelBubble = true;
                                                handleTextDoubleClick(e);
                                            }}
                                        />
                                        <Circle
                                            x={rectBounds.right}
                                            y={rectBounds.top}
                                            radius={5}
                                            fill="#fff"
                                            stroke="#4ab3ff"
                                            draggable={true}
                                            onMouseDown={(e) => {
                                                e.cancelBubble = true;
                                            }}
                                            onDragMove={(e) => onDrag("right", e)}
                                            onDblClick={(e) => {
                                                e.cancelBubble = true;
                                                handleTextDoubleClick(e);
                                            }}
                                        />
                                        <Circle
                                            x={rectBounds.left}
                                            y={rectBounds.bottom}
                                            radius={5}
                                            fill="#fff"
                                            stroke="#4ab3ff"
                                            draggable={true}
                                            onMouseDown={(e) => {
                                                e.cancelBubble = true;
                                            }}
                                            onDragMove={(e) => onDrag("leftB", e)}
                                            onDblClick={(e) => {
                                                e.cancelBubble = true;
                                                handleTextDoubleClick(e);
                                            }}
                                        />
                                        <Circle
                                            x={rectBounds.right}
                                            y={rectBounds.bottom}
                                            radius={5}
                                            fill="#fff"
                                            stroke="#4ab3ff"
                                            draggable={true}
                                            onMouseDown={(e) => {
                                                e.cancelBubble = true;
                                            }}
                                            onDragMove={(e) => onDrag("rightB", e)}
                                            onDblClick={(e) => {
                                                e.cancelBubble = true;
                                                handleTextDoubleClick(e);
                                            }}
                                        />
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
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleInputKeyDown}
                    onBlur={handleTextUpdate}
                    style={{
                        position: "absolute",
                        left: groupPos.x + pts.left.x,
                        top: groupPos.y + pts.left.y,
                        fontSize: textTypo.fontSize,
                        fontFamily: textTypo.fontFamily,
                        color: "#111",
                        background: "transparent",
                        border: "2px solid #4ab3ff",
                        outline: "none",
                        padding: 0,
                        margin: 0,
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
