import React, { useState } from "react";
import { Stage, Layer, Line, Circle } from "react-konva";

export default function BezierDemo() {
  const [points, setPoints] = useState({
    start: { x: 100, y: 300 },
    control1: { x: 200, y: 100 },
    control2: { x: 400, y: 500 },
    end: { x: 500, y: 300 },
  });

  const handleDrag = (key, e) => {
    setPoints({
      ...points,
      [key]: { x: e.target.x(), y: e.target.y() },
    });
  };

  return (
    <Stage width={600} height={600}>
      <Layer>
        {/* Bezier curve */}
        <Line
          points={[
            points.start.x, points.start.y,
            points.control1.x, points.control1.y,
            points.control2.x, points.control2.y,
            points.end.x, points.end.y,
          ]}
          stroke="cyan"
          strokeWidth={2}
          bezier
        />

        {/* Control lines */}
        <Line
          points={[points.start.x, points.start.y, points.control1.x, points.control1.y]}
          stroke="gray"
          dash={[4, 4]}
        />
        <Line
          points={[points.end.x, points.end.y, points.control2.x, points.control2.y]}
          stroke="gray"
          dash={[4, 4]}
        />

        {/* Draggable points */}
        {Object.entries(points).map(([key, pt]) => (
          <Circle
            key={key}
            x={pt.x}
            y={pt.y}
            radius={6}
            fill={key.includes("control") ? "red" : "blue"}
            draggable
            onDragMove={(e) => handleDrag(key, e)}
          />
        ))}
      </Layer>
    </Stage>
  );
}
