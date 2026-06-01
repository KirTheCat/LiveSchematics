// src/components/DiagramPage/Toolbar.jsx
import React, { useState } from 'react';
import styles from './Toolbar.module.css';

// Конфигурация элементов тулбара
const TOOLBAR_ITEMS = [
    { type: 'default', label: 'Прямоугольник' },
    { type: 'circle', label: 'Круг' },
    { type: 'cloud', label: 'Овал' },
    { type: 'diamond', label: 'Ромб' },
    { type: 'database', label: 'База данных' },
    { type: 'actor', label: 'Актер' },
    { type: 'divider' },
    { type: 'textblock', label: 'Текст' },
    { type: 'class', label: 'Класс' },
    { type: 'group', label: 'Группа', special: true },
];

const NodeIcon = ({ type }) => {
    switch (type) {
        case 'default':
            return <svg width="30" height="30" viewBox="0 0 30 30"><rect x="2" y="6" width="26" height="18" rx="2" fill="white" stroke="#555" strokeWidth="2" /></svg>;
        case 'circle':
            return <svg width="30" height="30" viewBox="0 0 30 30"><circle cx="15" cy="15" r="12" fill="white" stroke="#555" strokeWidth="2" /></svg>;
        case 'cloud':
            return <svg width="30" height="30" viewBox="0 0 30 30"><rect x="2" y="7" width="26" height="16" rx="8" fill="white" stroke="#555" strokeWidth="2" /></svg>;
        case 'diamond':
            return <svg width="30" height="30" viewBox="0 0 30 30"><rect x="6" y="6" width="18" height="18" fill="white" stroke="#555" strokeWidth="2" transform="rotate(45 15 15)" /></svg>;
        case 'database':
            return (
                <svg width="30" height="30" viewBox="0 0 30 30">
                    <ellipse cx="15" cy="8" rx="11" ry="5" fill="white" stroke="#555" strokeWidth="2" />
                    <path d="M4 8 L4 22 Q4 27 15 27 Q26 27 26 22 L26 8" fill="white" stroke="#555" strokeWidth="2" />
                </svg>
            );
        case 'actor':
            return (
                <svg width="30" height="30" viewBox="0 0 30 30">
                    <circle cx="15" cy="6" r="4" fill="white" stroke="#555" strokeWidth="2" />
                    <line x1="15" y1="10" x2="15" y2="20" stroke="#555" strokeWidth="2" />
                    <line x1="8" y1="14" x2="22" y2="14" stroke="#555" strokeWidth="2" />
                    <line x1="15" y1="20" x2="10" y2="28" stroke="#555" strokeWidth="2" />
                    <line x1="15" y1="20" x2="20" y2="28" stroke="#555" strokeWidth="2" />
                </svg>
            );
        case 'textblock':
            return <svg width="30" height="30" viewBox="0 0 30 30"><text x="15" y="22" fontFamily="sans-serif" fontSize="20" fontWeight="bold" fill="#555" textAnchor="middle">A</text></svg>;
        case 'class':
            return (
                <svg width="30" height="30" viewBox="0 0 30 30">
                    <rect x="3" y="3" width="24" height="7" fill="white" stroke="#555" strokeWidth="1.5" />
                    <rect x="3" y="10" width="24" height="10" fill="white" stroke="#555" strokeWidth="1.5" />
                    <rect x="3" y="20" width="24" height="7" fill="white" stroke="#555" strokeWidth="1.5" />
                </svg>
            );
        case 'group':
            return <svg width="30" height="30" viewBox="0 0 30 30"><rect x="2" y="2" width="26" height="26" fill="none" stroke="#aaa" strokeWidth="2" strokeDasharray="3,3" /></svg>;
        default:
            return null;
    }
};

const Toolbar = () => {
    const [isOpen, setIsOpen] = useState(true);

    const onDragStart = (event, nodeType) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    const asideClasses = [
        styles.aside,
        isOpen ? styles.asideOpen : styles.asideClosed
    ].join(' ');

    return (
        <aside className={asideClasses}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={styles.toggleBtn}
                title={isOpen ? "Свернуть" : "Развернуть"}
            >
                {isOpen ? '◀' : '▶'}
            </button>

            {isOpen && (
                <div className={styles.itemsContainer}>
                    {TOOLBAR_ITEMS.map((item, index) => {
                        if (item.type === 'divider') {
                            return <div key={index} className={styles.divider} />;
                        }

                        return (
                            <div
                                key={item.type}
                                title={item.label}
                                className={item.special ? styles.dndNodeSpecial : styles.dndNode}
                                onDragStart={(e) => onDragStart(e, item.type)}
                                draggable
                            >
                                <NodeIcon type={item.type} />
                            </div>
                        );
                    })}
                </div>
            )}
        </aside>
    );
};

export default Toolbar;