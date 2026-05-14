// CustomNodes.jsx
import React, { useState, useEffect, useRef, memo } from 'react';
import { Handle, Position, NodeResizer } from 'reactflow';

// --- Общие стили ---
const inputStyle = {
    width: '100%',
    height: '100%',
    border: 'none',
    background: 'transparent',
    textAlign: 'center',
    outline: 'none',
    fontFamily: 'sans-serif',
    padding: '10px',
    resize: 'none',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    wordBreak: 'break-word',
    boxSizing: 'border-box'
};

const UniversalHandles = () => (
    <>
        <Handle type="target" position={Position.Top} id="top-t" style={{ background: '#555' }} />
        <Handle type="source" position={Position.Top} id="top-s" style={{ background: '#555' }} />
        <Handle type="target" position={Position.Bottom} id="bottom-t" style={{ background: '#555' }} />
        <Handle type="source" position={Position.Bottom} id="bottom-s" style={{ background: '#555' }} />
        <Handle type="target" position={Position.Left} id="left-t" style={{ background: '#555' }} />
        <Handle type="source" position={Position.Left} id="left-s" style={{ background: '#555' }} />
        <Handle type="target" position={Position.Right} id="right-t" style={{ background: '#555' }} />
        <Handle type="source" position={Position.Right} id="right-s" style={{ background: '#555' }} />
    </>
);

// --- 1. Прямоугольник ---
export const DefaultBlock = memo(({ data, id, selected, style }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [label, setLabel] = useState(data.label);
    const inputRef = useRef(null);
    const nodeStyle = style || {};
    const textStyle = data.textStyle || {};

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
                width: '100%',
                height: '100%',
                background: nodeStyle.background || '#fff',
               // border: `2px solid ${nodeStyle.borderColor || '#555'}`,
                //borderRadius: '4px',
                boxSizing: 'border-box',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
            }}
        >
            <NodeResizer color={nodeStyle.borderColor || '#007bff'} isVisible={selected} minWidth={80} minHeight={40} />
            <UniversalHandles />
            {isEditing ? (
                <textarea
                    ref={inputRef}
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    onBlur={handleBlur}
                    style={{ ...inputStyle, color: textStyle.color || '#000', fontSize: textStyle.fontSize || '14px' }}
                />
            ) : (
                <div style={{ ...inputStyle, color: textStyle.color || '#000', fontSize: textStyle.fontSize || '14px' }}>
                    {label}
                </div>
            )}
        </div>
    );
});

// --- 2. Круг ---
export const CircleBlock = memo(({ data, id, selected, style }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [label, setLabel] = useState(data.label);
    const inputRef = useRef(null);

    const nodeStyle = data.nodeStyle || {};
    const textStyle = data.textStyle || {};
    const fillColor = nodeStyle.background || '#fff';
    const strokeColor = nodeStyle.borderColor || '#555';

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
                width: '100%',
                height: '100%',
                background: fillColor,
                border: `2px solid ${strokeColor}`,
                borderRadius: '50%',
                aspectRatio: '1 / 1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: selected ? `0 0 10px ${strokeColor}50` : 'none',
                overflow: 'hidden',
                boxSizing: 'border-box'
            }}
        >
            <NodeResizer color={strokeColor} isVisible={selected} minWidth={60} minHeight={60} lockAspectRatio={true} />
            <UniversalHandles />

            {isEditing ? (
                <textarea
                    ref={inputRef}
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    onBlur={handleBlur}
                    style={{ ...inputStyle, color: textStyle.color || '#000', fontSize: textStyle.fontSize || '12px', fontWeight: 'bold' }}
                />
            ) : (
                <div style={{ ...inputStyle, color: textStyle.color || '#000', fontSize: textStyle.fontSize || '12px', fontWeight: 'bold' }}>
                    {label}
                </div>
            )}
        </div>
    );
});


// --- 3. Облачко ---
export const CloudBlock = memo(({ data, id, selected, style }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [label, setLabel] = useState(data.label);
    const inputRef = useRef(null);

    const nodeStyle = data.nodeStyle || {};
    const textStyle = data.textStyle || {};
    const fillColor = nodeStyle.background || '#e3f2fd';
    const strokeColor = nodeStyle.borderColor || '#90caf9';

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
                width: '100%',
                height: '100%',
                background: fillColor,
                border: `2px solid ${strokeColor}`,
                borderRadius: '50px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: selected ? `0 0 10px ${strokeColor}40` : 'none',
                overflow: 'hidden',
                boxSizing: 'border-box',
                padding: '10px'
            }}
        >
            <NodeResizer color={strokeColor} isVisible={selected} minWidth={80} minHeight={50} />
            <UniversalHandles />

            {isEditing ? (
                <textarea
                    ref={inputRef}
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    onBlur={handleBlur}
                    style={{ ...inputStyle, color: textStyle.color || '#000', fontSize: textStyle.fontSize || '12px' }}
                />
            ) : (
                <div style={{ ...inputStyle, color: textStyle.color || '#000', fontSize: textStyle.fontSize || '12px' }}>
                    {label}
                </div>
            )}
        </div>
    );
});

// --- 4. Текстовый блок ---
export const TextBlock = memo(({ data, id, selected, style }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [label, setLabel] = useState(data.label);
    const inputRef = useRef(null);
    const nodeStyle = style || {};
    const textStyle = data.textStyle || {};

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
                if (data.onDelete) data.onDelete(id);
            }, 0);
        } else {
            data.label = label;
        }
    };

    return (
        <div
            onDoubleClick={() => setIsEditing(true)}
            style={{
                width: '100%',
                height: '100%',
                background: nodeStyle.background || 'transparent',
                border: selected ? '1px dashed #ccc' : 'none',
                boxSizing: 'border-box',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
            }}
        >
            <NodeResizer color="#aaa" isVisible={selected} minWidth={50} minHeight={20} lineStyle={{ border: '1px dashed #aaa' }} />
            <UniversalHandles />
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
                        fontSize: textStyle.fontSize || '14px',
                        color: textStyle.color || '#000',
                        textAlign: 'center',
                        width: '100%',
                        padding: '5px'
                    }}
                />
            ) : (
                <div style={{ fontSize: textStyle.fontSize || '14px', color: textStyle.color || '#000', whiteSpace: 'pre-wrap', textAlign: 'center' }}>
                    {label}
                </div>
            )}
        </div>
    );
});

// --- 5. Актер (Человечек) ---
export const ActorBlock = memo(({ data, id, selected, style }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [label, setLabel] = useState(data.label);
    const inputRef = useRef(null);

    const nodeStyle = data.nodeStyle || {};
    const strokeColor = nodeStyle.borderColor || '#555';
    const fillColor = nodeStyle.background || '#fff';
    const textStyle = data.textStyle || {};

    const handleBlur = () => {
        setIsEditing(false);
        data.label = label;
    };

    return (
        <div
            onDoubleClick={() => setIsEditing(true)}
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                background: 'transparent', // Прозрачный контейнер
                paddingTop: '10px'
            }}
        >
            <NodeResizer color={strokeColor} isVisible={selected} minWidth={40} minHeight={80} />
            <UniversalHandles />

            {/* SVG Человечка */}
            <svg width="40" height="60" viewBox="0 0 100 150" style={{ flexShrink: 0 }}>
                <circle cx="50" cy="25" r="20" fill={fillColor} stroke={strokeColor} strokeWidth="3" />
                <line x1="50" y1="45" x2="50" y2="100" stroke={strokeColor} strokeWidth="3" />
                <line x1="20" y1="70" x2="80" y2="70" stroke={strokeColor} strokeWidth="3" />
                <line x1="50" y1="100" x2="20" y2="150" stroke={strokeColor} strokeWidth="3" />
                <line x1="50" y1="100" x2="80" y2="150" stroke={strokeColor} strokeWidth="3" />
            </svg>

            {/* Подпись */}
            <div style={{ marginTop: '5px', width: '100%', textAlign: 'center' }}>
                {isEditing ?
                    <input
                        ref={inputRef}
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        onBlur={handleBlur}
                        style={{
                            border: 'none',
                            background: 'transparent',
                            outline: 'none',
                            textAlign: 'center',
                            fontSize: textStyle.fontSize || '12px',
                            color: textStyle.color || '#000',
                            width: '100%'
                        }}
                    /> :
                    <span style={{ fontSize: textStyle.fontSize || '12px', color: textStyle.color || '#000' }}>
                        {label}
                    </span>
                }
            </div>
        </div>
    );
});

// --- 6. База данных (Цилиндр) ---
export const DatabaseBlock = memo(({ data, id, selected, style }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [label, setLabel] = useState(data.label);
    const inputRef = useRef(null);

    const nodeStyle = data.nodeStyle || {};
    const strokeColor = nodeStyle.borderColor || '#555';
    const fillColor = nodeStyle.background || '#fff';
    const textStyle = data.textStyle || {};

    const handleBlur = () => {
        setIsEditing(false);
        data.label = label;
    };

    return (
        <div
            onDoubleClick={() => setIsEditing(true)}
            style={{
                width: '110%',
                height: '110%',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent', // Прозрачный контейнер
            }}
        >
            <NodeResizer color={strokeColor} isVisible={selected} minWidth={60} minHeight={60} />
            <UniversalHandles />

            {/* SVG Цилиндр */}
            <svg width="100%" height="100%" viewBox="-2 -5 105 130" preserveAspectRatio="none" style={{ position: 'absolute', top: 0, left: 0 }}>
                <path
                    d="M0,20 Q0,0 50,0 Q100,0 100,20 L100,90 Q100,110 50,110 Q0,110 0,90 L0,20 Z"
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth="2"
                />
                <ellipse
                    cx="50"
                    cy="20"
                    rx="50"
                    ry="20"
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth="2"
                />
            </svg>

            <div style={{ position: 'relative', zIndex: 1, padding: '35px 10px 10px 10px', textAlign: 'center', width: '100%' }}>
                {isEditing ?
                    <textarea
                        ref={inputRef}
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        onBlur={handleBlur}
                        style={{
                            border: 'none',
                            background: 'transparent',
                            outline: 'none',
                            textAlign: 'center',
                            fontSize: textStyle.fontSize || '12px',
                            color: textStyle.color || '#000',
                            width: '100%',
                            resize: 'none'
                        }}
                    /> :
                    <div style={{ fontSize: textStyle.fontSize || '12px', fontWeight: 'bold', color: textStyle.color || '#000' }}>
                        {label}
                    </div>
                }
            </div>
        </div>
    );
});

// --- 7. Ромб (Решение) ---
export const DiamondBlock = memo(({ data, id, selected, style }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [label, setLabel] = useState(data.label);
    const inputRef = useRef(null);

    const nodeStyle = data.nodeStyle || {};
    const strokeColor = nodeStyle.borderColor || '#555';
    const fillColor = nodeStyle.background || '#fff';
    const textStyle = data.textStyle || {};

    const handleBlur = () => {
        setIsEditing(false);
        data.label = label;
    };

    return (
        <div
            onDoubleClick={() => setIsEditing(true)}
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent', // Прозрачный контейнер
                overflow: 'hidden'
            }}
        >
            <NodeResizer color={strokeColor} isVisible={selected} minWidth={80} minHeight={80} />
            <UniversalHandles />

            {/* Внутренний повернутый квадрат */}
            <div style={{
                width: '70%',
                height: '70%',
                background: fillColor,
                border: `2px solid ${strokeColor}`,
                transform: 'rotate(45deg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                {/* Текст */}
                <div style={{ transform: 'rotate(-45deg)', textAlign: 'center', width: '100%' }}>
                    {isEditing ?
                        <input
                            ref={inputRef}
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            onBlur={handleBlur}
                            style={{
                                border: 'none',
                                background: 'transparent',
                                outline: 'none',
                                textAlign: 'center',
                                fontSize: textStyle.fontSize || '12px',
                                color: textStyle.color || '#000',
                                width: '100%'
                            }}
                        /> :
                        <span style={{ fontSize: textStyle.fontSize || '12px', color: textStyle.color || '#000' }}>
                            {label}
                        </span>
                    }
                </div>
            </div>
        </div>
    );
});

// --- 8. Класс (UML) ---
export const ClassBlock = memo(({ data, id, selected, style }) => {
    const nodeStyle = style || {};
    const textStyle = data.textStyle || {};

    return (
        <div style={{
            width: '100%',
            height: '100%',
            background: nodeStyle.background || '#fff',
            border: `2px solid ${nodeStyle.borderColor || '#555'}`,
            borderRadius: '4px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
        }}>
            <NodeResizer color="#555" isVisible={selected} minWidth={100} minHeight={100} />
            <UniversalHandles />

            <div style={{
                borderBottom: `2px solid ${nodeStyle.borderColor || '#555'}`,
                padding: '8px',
                fontWeight: 'bold',
                textAlign: 'center',
                background: nodeStyle.background || '#fff',
                fontSize: textStyle.fontSize || '14px',
                color: textStyle.color || '#000'
            }}>
                {data.label}
            </div>
            <div style={{
                borderBottom: `2px solid ${nodeStyle.borderColor || '#555'}`,
                padding: '8px',
                flexGrow: 1,
                fontSize: '12px',
                textAlign: 'left',
                whiteSpace: 'pre-wrap'
            }}>
                {data.attributes || ''}
            </div>
            <div style={{ padding: '8px', flexGrow: 1, fontSize: '12px', textAlign: 'left', whiteSpace: 'pre-wrap' }}>
                {data.methods || ''}
            </div>
        </div>
    );
});

// --- 9. Группа / Контейнер ---
export const GroupBlock = memo(({ data, id, selected, style }) => {
    const nodeStyle = style || {};

    return (
        <div style={{
            width: '100%',
            height: '100%',
            background: nodeStyle.background || 'rgba(240, 240, 240, 0.5)',
            border: `2px dashed ${nodeStyle.borderColor || '#aaa'}`,
            borderRadius: '10px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <NodeResizer color="#aaa" isVisible={selected} minWidth={200} minHeight={150} />
            <UniversalHandles />

            <div style={{
                padding: '5px 10px',
                borderBottom: `1px dashed ${nodeStyle.borderColor || '#aaa'}`,
                fontWeight: 'bold',
                color: '#555'
            }}>
                {data.label}
            </div>
            <div style={{ flexGrow: 1 }}></div>
        </div>
    );
});