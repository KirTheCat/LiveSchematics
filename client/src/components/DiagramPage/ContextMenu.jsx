//src/components/DiagramPage/ContextMenu.jsx
import React, { useEffect, useRef } from 'react';
import styles from './ContextMenu.module.css';

const ContextMenu = ({ x, y, nodeId, onClose, onDuplicate, onDelete }) => {
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                onClose();
            }
        };

        const timer = setTimeout(() => {
            window.addEventListener('click', handleClickOutside);
        }, 100);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('click', handleClickOutside);
        };
    }, [onClose]);

    const handleDuplicate = () => {
        onDuplicate(nodeId);
        onClose();
    };

    const handleDelete = () => {
        onDelete(nodeId);
        onClose();
    };

    return (
        <div ref={menuRef} className={styles.menu} style={{ left: x, top: y }}>
            <div className={styles.item} onClick={handleDuplicate}>
                <span className={styles.icon}>📋</span> Дублировать
            </div>
            <div className={styles.itemDanger} onClick={handleDelete}>
                <span className={styles.icon}>🗑️</span> Удалить
            </div>
        </div>
    );
};

export default ContextMenu;