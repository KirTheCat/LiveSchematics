// src/components/MarkerDefinitions.jsx
import React from 'react';

const MarkerDefinitions = () => {
    return (
        <svg style={{ position: 'absolute', width: 0, height: 0 }}>
            <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
                </marker>
                <marker id="arrow-hollow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="white" stroke="currentColor" strokeWidth="1.5"/>
                </marker>
                <marker id="circle" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                    <circle cx="5" cy="5" r="4" fill="currentColor" />
                </marker>
                <marker id="circle-hollow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                    <circle cx="5" cy="5" r="3.5" fill="white" stroke="currentColor" strokeWidth="1" />
                </marker>
                <marker id="diamond" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                    <path d="M 0 5 L 5 0 L 10 5 L 5 10 z" fill="currentColor" stroke="currentColor"/>
                </marker>
                <marker id="diamond-hollow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                    <path d="M 0 5 L 5 0 L 10 5 L 5 10 z" fill="white" stroke="currentColor"/>
                </marker>
            </defs>
        </svg>
    );
};

export default MarkerDefinitions;