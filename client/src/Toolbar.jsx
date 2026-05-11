// Toolbar.jsx
import React from 'react';

const Toolbar = () => {
    const onDragStart = (event, nodeType) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <aside
            style={{
                width: '80px',
                backgroundColor: '#f0f2f5',
                padding: '10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '15px',
                alignItems: 'center',
                borderRight: '1px solid #ddd'
            }}
        >
            <div style={{ fontSize: '10px', textAlign: 'center', color: '#666' }}>Фигуры</div>

            {/* Прямоугольник */}
            <div
                className="dnd-node"
                onDragStart={(e) => onDragStart(e, 'default')}
                draggable
                style={{
                    width: '40px',
                    height: '20px',
                    border: '1px solid #555',
                    background: '#fff',
                    cursor: 'grab',
                    borderRadius: '2px'
                }}
            />

            {/* Круг */}
            <div
                className="dnd-node"
                onDragStart={(e) => onDragStart(e, 'circle')}
                draggable
                style={{
                    width: '30px',
                    height: '30px',
                    border: '1px solid #555',
                    background: '#fff',
                    cursor: 'grab',
                    borderRadius: '50%'
                }}
            />

            {/* Облачко */}
            <div
                className="dnd-node"
                onDragStart={(e) => onDragStart(e, 'cloud')}
                draggable
                style={{
                    width: '40px',
                    height: '25px',
                    border: '1px solid #555',
                    background: '#fff',
                    cursor: 'grab',
                    borderRadius: '25px'
                }}
            />

            <div style={{ fontSize: '10px', textAlign: 'center', color: '#666', marginTop: '10px' }}>Текст</div>

            {/* Текст (Специальный блок) */}
            <div
                className="dnd-node"
                onDragStart={(e) => onDragStart(e, 'textblock')}
                draggable
                style={{
                    width: '40px',
                    height: '20px',
                    background: 'transparent',
                    border: '1px dashed #aaa',
                    cursor: 'grab',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    color: '#aaa'
                }}
            >
                Text
            </div>
        </aside>
    );
};

export default Toolbar;