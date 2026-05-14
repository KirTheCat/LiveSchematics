// Toolbar.jsx
import React from 'react';

const Toolbar = () => {
    const onDragStart = (event, nodeType) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    const iconStyle = { width: '40px', height: '40px', border: '1px solid #ddd', background: '#fff', cursor: 'grab', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2px' };

    return (
        <aside style={{ width: '60px', backgroundColor: '#f0f2f5', padding: '10px 5px', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', borderRight: '1px solid #ddd', overflowY: 'auto' }}>

            {/* Прямоугольник */}
            <div title="Прямоугольник" className="dnd-node" onDragStart={(e) => onDragStart(e, 'default')} draggable style={iconStyle}>
                <svg width="30" height="20" viewBox="0 0 30 20"><rect x="1" y="1" width="28" height="18" fill="white" stroke="black" strokeWidth="1" rx="1" /></svg>
            </div>

            {/* Круг */}
            <div title="Круг" className="dnd-node" onDragStart={(e) => onDragStart(e, 'circle')} draggable style={iconStyle}>
                <svg width="20" height="20" viewBox="0 0 20 20"><circle cx="10" cy="10" r="9" fill="white" stroke="black" strokeWidth="1" /></svg>
            </div>

            {/* Овал (Облако) */}
            <div title="Овал" className="dnd-node" onDragStart={(e) => onDragStart(e, 'cloud')} draggable style={iconStyle}>
                <svg width="30" height="20" viewBox="0 0 30 20"><rect x="1" y="1" width="28" height="18" fill="white" stroke="black" strokeWidth="1" rx="10" /></svg>
            </div>

            {/* Ромб */}
            <div title="Ромб" className="dnd-node" onDragStart={(e) => onDragStart(e, 'diamond')} draggable style={iconStyle}>
                <svg width="20" height="20" viewBox="0 0 20 20"><rect x="3" y="3" width="14" height="14" fill="white" stroke="black" strokeWidth="1" transform="rotate(45 10 10)" /></svg>
            </div>

            {/* База данных */}
            <div title="База данных" className="dnd-node" onDragStart={(e) => onDragStart(e, 'database')} draggable style={iconStyle}>
                <svg width="24" height="30" viewBox="0 0 24 30">
                    <ellipse cx="12" cy="6" rx="10" ry="5" fill="white" stroke="black" strokeWidth="1" />
                    <path d="M2 6 L2 24 Q2 29 12 29 Q22 29 22 24 L22 6" fill="white" stroke="black" strokeWidth="1" />
                </svg>
            </div>

            {/* Актер */}
            <div title="Актер" className="dnd-node" onDragStart={(e) => onDragStart(e, 'actor')} draggable style={iconStyle}>
                <svg width="20" height="30" viewBox="0 0 20 30">
                    <circle cx="10" cy="5" r="4" fill="white" stroke="black" strokeWidth="1" />
                    <line x1="10" y1="9" x2="10" y2="18" stroke="black" strokeWidth="1" />
                    <line x1="3" y1="13" x2="17" y2="13" stroke="black" strokeWidth="1" />
                    <line x1="10" y1="18" x2="5" y2="28" stroke="black" strokeWidth="1" />
                    <line x1="10" y1="18" x2="15" y2="28" stroke="black" strokeWidth="1" />
                </svg>
            </div>

            {/* Разделитель */}
            <div style={{ height: '1px', width: '100%', background: '#ddd', margin: '5px 0' }}></div>

            {/* Класс UML */}
            <div title="Класс" className="dnd-node" onDragStart={(e) => onDragStart(e, 'class')} draggable style={iconStyle}>
                <svg width="30" height="30" viewBox="0 0 30 30">
                    <rect x="1" y="1" width="28" height="8" fill="white" stroke="black" strokeWidth="1" />
                    <rect x="1" y="9" width="28" height="10" fill="white" stroke="black" strokeWidth="1" />
                    <rect x="1" y="19" width="28" height="10" fill="white" stroke="black" strokeWidth="1" />
                </svg>
            </div>

            {/* Группа */}
            <div title="Группа" className="dnd-node" onDragStart={(e) => onDragStart(e, 'group')} draggable style={{...iconStyle, border: '1px dashed #aaa', background: '#f9f9f9'}}>
                <svg width="30" height="20" viewBox="0 0 30 20">
                    <rect x="1" y="1" width="28" height="18" fill="#f0f0f0" stroke="#aaa" strokeWidth="1" strokeDasharray="3,3" />
                </svg>
            </div>

        </aside>
    );
};

export default Toolbar;