// src/Toolbar.jsx
import React, { useState } from 'react';

const Toolbar = () => {
    const [isOpen, setIsOpen] = useState(true);

    const onDragStart = (event, nodeType) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    const asideStyle = {
        width: isOpen ? '80px' : '40px',
        minWidth: isOpen ? '80px' : '40px',
        backgroundColor: '#f8f9fa',
        borderRight: '1px solid #e0e0e0',
        transition: 'width 0.2s ease-in-out',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: '10px',
        paddingBottom: '10px',
        position: 'relative',
        overflow: 'hidden',
        zIndex: 10,
    };

    const iconContainerStyle = {
        width: '50px',
        height: '50px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '10px',
        background: '#fff',
        border: '1px solid #ddd',
        borderRadius: '8px',
        cursor: 'grab',
        transition: 'transform 0.1s, box-shadow 0.1s',
    };

    return (
        <aside style={asideStyle}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: 'absolute',
                    top: '10px',
                    right: '5px',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    fontSize: '12px',
                    color: '#666'
                }}
                title={isOpen ? "Свернуть" : "Развернуть"}
            >
                {isOpen ? '◀' : '▶'}
            </button>

            {isOpen && (
                <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                    {/* Прямоугольник */}
                    <div title="Прямоугольник" className="dnd-node" onDragStart={(e) => onDragStart(e, 'default')} draggable style={iconContainerStyle}>
                        <svg width="30" height="30" viewBox="0 0 30 30"><rect x="2" y="6" width="26" height="18" rx="2" fill="white" stroke="#555" strokeWidth="2" /></svg>
                    </div>

                    {/* Круг */}
                    <div title="Круг" className="dnd-node" onDragStart={(e) => onDragStart(e, 'circle')} draggable style={iconContainerStyle}>
                        <svg width="30" height="30" viewBox="0 0 30 30"><circle cx="15" cy="15" r="12" fill="white" stroke="#555" strokeWidth="2" /></svg>
                    </div>

                    {/* Овал (Облако) */}
                    <div title="Овал" className="dnd-node" onDragStart={(e) => onDragStart(e, 'cloud')} draggable style={iconContainerStyle}>
                        <svg width="30" height="30" viewBox="0 0 30 30"><rect x="2" y="7" width="26" height="16" rx="8" fill="white" stroke="#555" strokeWidth="2" /></svg>
                    </div>

                    {/* Ромб */}
                    <div title="Ромб" className="dnd-node" onDragStart={(e) => onDragStart(e, 'diamond')} draggable style={iconContainerStyle}>
                        <svg width="30" height="30" viewBox="0 0 30 30"><rect x="6" y="6" width="18" height="18" fill="white" stroke="#555" strokeWidth="2" transform="rotate(45 15 15)" /></svg>
                    </div>

                    {/* База данных */}
                    <div title="База данных" className="dnd-node" onDragStart={(e) => onDragStart(e, 'database')} draggable style={iconContainerStyle}>
                        <svg width="30" height="30" viewBox="0 0 30 30">
                            <ellipse cx="15" cy="8" rx="11" ry="5" fill="white" stroke="#555" strokeWidth="2" />
                            <path d="M4 8 L4 22 Q4 27 15 27 Q26 27 26 22 L26 8" fill="white" stroke="#555" strokeWidth="2" />
                        </svg>
                    </div>

                    {/* Актер */}
                    <div title="Актер" className="dnd-node" onDragStart={(e) => onDragStart(e, 'actor')} draggable style={iconContainerStyle}>
                        <svg width="30" height="30" viewBox="0 0 30 30">
                            <circle cx="15" cy="6" r="4" fill="white" stroke="#555" strokeWidth="2" />
                            <line x1="15" y1="10" x2="15" y2="20" stroke="#555" strokeWidth="2" />
                            <line x1="8" y1="14" x2="22" y2="14" stroke="#555" strokeWidth="2" />
                            <line x1="15" y1="20" x2="10" y2="28" stroke="#555" strokeWidth="2" />
                            <line x1="15" y1="20" x2="20" y2="28" stroke="#555" strokeWidth="2" />
                        </svg>
                    </div>

                    <div style={{ width: '80%', height: '1px', background: '#ddd', margin: '10px 0' }}></div>

                    {/* Текст (Буква А) */}
                    <div title="Текст" className="dnd-node" onDragStart={(e) => onDragStart(e, 'textblock')} draggable style={iconContainerStyle}>
                        <svg width="30" height="30" viewBox="0 0 30 30">
                            <text x="15" y="22" fontFamily="sans-serif" fontSize="20" fontWeight="bold" fill="#555" textAnchor="middle">A</text>
                        </svg>
                    </div>

                    {/* Класс UML */}
                    <div title="Класс" className="dnd-node" onDragStart={(e) => onDragStart(e, 'class')} draggable style={iconContainerStyle}>
                        <svg width="30" height="30" viewBox="0 0 30 30">
                            <rect x="3" y="3" width="24" height="7" fill="white" stroke="#555" strokeWidth="1.5" />
                            <rect x="3" y="10" width="24" height="10" fill="white" stroke="#555" strokeWidth="1.5" />
                            <rect x="3" y="20" width="24" height="7" fill="white" stroke="#555" strokeWidth="1.5" />
                        </svg>
                    </div>

                    {/* Группа */}
                    <div title="Группа" className="dnd-node" onDragStart={(e) => onDragStart(e, 'group')} draggable style={{...iconContainerStyle, border: '1px dashed #aaa', background: '#fcfcfc'}}>
                        <svg width="30" height="30" viewBox="0 0 30 30">
                            <rect x="2" y="2" width="26" height="26" fill="none" stroke="#aaa" strokeWidth="2" strokeDasharray="3,3" />
                        </svg>
                    </div>

                </div>
            )}
        </aside>
    );
};

export default Toolbar;