import React, { useEffect, useRef } from 'react';

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
        <div
            ref={menuRef}
            style={{
                position: 'fixed',
                left: x,
                top: y,
                background: '#fff',
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                zIndex: 9999,
                minWidth: '160px',
                overflow: 'hidden',
                padding: '4px 0'
            }}
        >
            <div style={styles.item} onClick={handleDuplicate}>
                <span style={styles.icon}>📋</span> Дублировать
            </div>
            <div style={{ ...styles.item, color: '#dc3545' }} onClick={handleDelete}>
                <span style={styles.icon}>🗑️</span> Удалить
            </div>
        </div>
    );
};

const styles = {
    item: {
        padding: '8px 12px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        fontSize: '14px',
        transition: 'background 0.2s',
        borderBottom: '1px solid #f0f0f0'
    },
    icon: {
        marginRight: '8px',
        fontSize: '14px'
    }
};

export default ContextMenu;