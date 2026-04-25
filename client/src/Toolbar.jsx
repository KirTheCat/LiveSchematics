// Toolbar.jsx
import React from 'react';

const Toolbar = ({ onAddNode, onDeleteSelected }) => {
    return (
        <div className="toolbar">
            <button onClick={onAddNode}>Добавить блок</button>
            <button onClick={onDeleteSelected} style={{ color: 'red' }}>
                Удалить выбранное
            </button>
        </div>
    );
};

export default Toolbar;