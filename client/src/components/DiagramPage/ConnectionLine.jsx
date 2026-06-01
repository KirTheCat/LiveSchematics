// src/components/DiagramPage/ConnectionLine.jsx
import React from 'react';

export const ConnectionLine = ({ fromX, fromY, toX, toY }) => {
    return (
        <g>
            <path
                fill="none"
                stroke="#333"
                strokeWidth={2}
                d={`M${fromX},${fromY} L${toX},${toY}`}
            />
            <polygon
                points="0,-6 12,0 0,6"
                fill="#333"
                transform={`translate(${toX},${toY}) rotate(${Math.atan2(toY - fromY, toX - fromX) * 180 / Math.PI + 90})`}
            />
        </g>
    );
}