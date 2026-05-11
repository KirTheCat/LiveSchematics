// CustomNodes.jsx
import React, { useState, useEffect, useRef, memo } from 'react';
import { Handle, Position } from 'reactflow';

const inputStyle = {
    width: '100%',
    border: 'none',
    background: 'transparent',
    textAlign: 'center',
    outline: 'none',
    fontSize: '12px',
    fontFamily: 'sans-serif',
    padding: '0',
    resize: 'none',
    overflow: 'hidden',
    display: 'block',
    lineHeight: 'normal'
};

// --- 1. Прямоугольник  ---
export const DefaultBlock = memo(({ data, id, selected }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [label, setLabel] = useState(data.label);
    const inputRef = useRef(null);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleBlur = () => {
        setIsEditing(false);
        data.label = label;
    };

    return (
        <div
            onDoubleClick={() => setIsEditing(true)}
            style={{
                padding: '10px 20px',
                background: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxSizing: 'border-box',
                width: 'auto',
                height: 'auto',
            }}
        >
            <Handle type="target" position={Position.Top} />

            {isEditing ? (
                <textarea
                    ref={inputRef}
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    onBlur={handleBlur}
                    style={{
                        width: '100%',
                        height: '100%',
                        resize: 'none',
                        border: 'none',
                        outline: 'none',
                        textAlign: 'center',
                        boxSizing: 'border-box',
                        font: 'inherit',
                    }}
                />
            ) : (
                <div
                    style={{
                        wordBreak: 'break-word',
                        textAlign: 'center',
                        width: '100%',
                        boxSizing: 'border-box',
                    }}
                >
                    {label}
                </div>
            )}

            <Handle type="source" position={Position.Bottom} />
        </div>
    );
});

// --- 2. Круг ---
export const CircleBlock = memo(({ data, id, selected }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [label, setLabel] = useState(data.label);
    const inputRef = useRef(null);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleBlur = () => {
        setIsEditing(false);
        data.label = label;
    };

    return (
        <div
            onDoubleClick={() => setIsEditing(true)}
            style={{
                width: '80px',
                height: '80px',
                border: `2px solid ${selected ? '#ff5722' : '#555'}`,
                borderRadius: '50%',
                background: '#fff',
                boxShadow: selected ? '0 0 10px rgba(255,87,34,0.3)' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
        >
            <Handle type="target" position={Position.Left} style={{ top: '50%' }} />
            <div style={{ width: '60px', textAlign: 'center' }}>
                {isEditing ? (
                    <textarea
                        ref={inputRef}
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        onBlur={handleBlur}
                        style={{ ...inputStyle, minHeight: '40px' }}
                    />
                ) : (
                    <div style={{ fontSize: '11px', fontWeight: 'bold', wordBreak: 'break-word' }}>
                        {label}
                    </div>
                )}
            </div>
            <Handle type="source" position={Position.Right} style={{ top: '50%' }} />
        </div>
    );
});

// --- 3. Облачко ---
export const CloudBlock = memo(({ data, id, selected }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [label, setLabel] = useState(data.label);
    const inputRef = useRef(null);

    useEffect(() => {
        if (isEditing && inputRef.current) inputRef.current.focus();
    }, [isEditing]);

    const handleBlur = () => {
        setIsEditing(false);
        data.label = label;
    };

    return (
        <div
            onDoubleClick={() => setIsEditing(true)}
            style={{
                padding: '20px 25px',
                background: '#e3f2fd',
                border: `2px solid ${selected ? '#2196f3' : '#90caf9'}`,
                borderRadius: '50px',
                boxShadow: selected ? '0 0 10px rgba(33,150,243,0.4)' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
        >
            <Handle type="target" position={Position.Top} style={{ left: '30%' }} />
            {isEditing ? (
                <textarea ref={inputRef} value={label} onChange={(e) => setLabel(e.target.value)} onBlur={handleBlur} style={{ ...inputStyle, minWidth: '60px' }} />
            ) : (
                <div style={{ fontSize: '12px', wordBreak: 'break-word', textAlign: 'center' }}>{label}</div>
            )}
            <Handle type="source" position={Position.Bottom} style={{ left: '70%' }} />
        </div>
    );
});

// --- 4. Текстовый блок ---
export const TextBlock = memo(({ data, id, selected }) => {
    const [isEditing, setIsEditing] = useState(false);

    const [label, setLabel] = useState(data.label);
    const inputRef = useRef(null);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleBlur = () => {
        setIsEditing(false);

        if (label.trim() === '') {
            setTimeout(() => {
                if (data.onDelete) {
                    data.onDelete(id);
                }
            }, 0);
        } else {
            data.label = label;
        }
    };

    return (
        <div
            onDoubleClick={() => setIsEditing(true)}
            style={{
                background: 'transparent',
                border: selected ? '1px dashed #ccc' : 'none',
                minWidth: '50px',
                padding: '5px'
            }}
        >
            <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />

            {isEditing ? (
                <input
                    ref={inputRef}
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    onBlur={handleBlur}
                    onKeyDown={(e) => e.key === 'Enter' && handleBlur()}
                    style={{
                        border: 'none',
                        background: 'transparent',
                        outline: 'none',
                        fontSize: '14px',
                        minWidth: '50px',
                        textAlign: 'center'
                    }}
                />
            ) : (
                <div style={{ fontSize: '14px', whiteSpace: 'pre-wrap' }}>{label}</div>
            )}

            <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
        </div>
    );
});