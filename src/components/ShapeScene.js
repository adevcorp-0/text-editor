import React, { useEffect, useMemo, useRef, useState } from "react";
import Konva from "konva";
import { Shape } from "react-konva";
import { Stage, Layer, Line, Circle, Group } from "react-konva";

export default function ShapeScene() {
    return (
        <Stage width={735} height={735} className="bg-white">
            <Layer>
                <Shape
                    x={100}
                    y={100}
                    draggable={true}
                    sceneFunc={(ctx, shape) => {
                        ctx.fillStyle = "red";
                        ctx.fillRect(0, 0, 150, 100);                        
                        ctx.fillStyle = "blue";
                        ctx.beginPath();
                        ctx.arc(75, 50, 30, 0, 2 * Math.PI);
                        ctx.fill();
                        
                        ctx.fillStyle = "yellow";
                        ctx.beginPath();
                        ctx.moveTo(40, 20);
                        ctx.lineTo(110, 20);
                        ctx.lineTo(75, 80);
                        ctx.closePath();
                        ctx.fill();
                        
                        ctx.strokeStyle = "black";
                        ctx.lineWidth = 3;
                        ctx.strokeRect(0, 0, 150, 100);
                        
                        ctx.fillStyle = "white";
                        ctx.font = "16px Arial";
                        ctx.textAlign = "center";
                        ctx.fillText("Hello World!", 75, 50);
                        
                        ctx.fillStrokeShape(shape);
                    }}
                    listening={true}
                />
            </Layer>
        </Stage>
    );
}
