// src/components/DiagramPage/Inspector.jsx
import React from 'react';
import styles from './Inspector.module.css';

const MARKER_OPTIONS = [
    { label: 'Нет', value: '' },
    { label: 'Полная стрелка', value: 'arrow' },
    { label: 'Пустая стрелка', value: 'arrow-hollow' },
    { label: 'Круг', value: 'circle' },
    { label: 'Полый круг', value: 'circle-hollow' },
    { label: 'Ромб (Композиция)', value: 'diamond' },
    { label: 'Полый ромб (Агрегация)', value: 'diamond-hollow' },
];

const safeColor = (color) => {
    if (!color) return '#ffffff';
    if (/^#[0-9A-Fa-f]{3}$/.test(color)) {
        return '#' + color[1] + color[1] + color[2] + color[2] + color[3] + color[3];
    }
    if (!color.startsWith('#')) return '#ffffff';
    return color;
};

const Inspector = ({
                       isOpen,
                       onToggle,
                       selectedNode,
                       selectedEdge,
                       onNodeChange,
                       onEdgeChange,
                       showHandles,
                       onToggleHandles,
                       roomInfo
                   }) => {

    const getMarkerId = (marker) => {
        if (!marker) return '';
        if (typeof marker === 'string') {
            if (marker.startsWith('url(#')) return marker.substring(5, marker.length - 1);
            return marker;
        }
        return marker.type || '';
    };

    const renderRoomInfo = () => (
        <div className={styles.infoBlock}>
            <h4 className={styles.roomTitle} title={roomInfo?.roomName}>
                {roomInfo?.roomName || 'Загрузка...'}
            </h4>
            <div className={styles.roomDetails}>
                <span className={styles.detailItem}>
                    ID: <span className={styles.detailValue}>{roomInfo?.roomId || '...'}</span>
                </span>
                <span className={styles.detailItem}>
                    Создатель: <span className={styles.detailValue}>{roomInfo?.creatorName || '...'}</span>
                </span>
            </div>
        </div>
    );

    const renderGlobalSettings = () => (
        <div className={styles.settingsBlock}>
            <div className={styles.toggleRow}>
                <span className={styles.toggleLabel}>Показать точки связей</span>
                <div
                    onClick={onToggleHandles}
                    className={styles.switchTrack}
                    style={{ backgroundColor: showHandles ? '#007bff' : '#ccc' }}
                >
                    <div
                        className={styles.switchThumb}
                        style={{ left: showHandles ? '22px' : '2px' }}
                    />
                </div>
            </div>
        </div>
    );

    const renderNodeProperties = () => {
        if (!selectedNode) return null;

        const nodeStyle = selectedNode.data.nodeStyle || selectedNode.style || {};
        const textStyle = selectedNode.data.textStyle || {};

        const handleChange = (key, value, isTextStyle = false) => {
            if (isTextStyle) {
                onNodeChange(selectedNode.id, { data: { ...selectedNode.data, textStyle: { ...textStyle, [key]: value } } });
            } else {
                onNodeChange(selectedNode.id, { data: { ...selectedNode.data, nodeStyle: { ...nodeStyle, [key]: value } } });
            }
        };

        return (
            <div className={styles.propertiesSection}>
                <h3 className={styles.sectionTitle}>Свойства фигуры</h3>

                <div className={styles.group}>
                    <label className={styles.label}>Цвет фона:</label>
                    <input type="color" value={safeColor(nodeStyle.background)} onChange={(e) => handleChange('background', e.target.value)} />
                </div>

                <div className={styles.group}>
                    <label className={styles.label}>Цвет границы:</label>
                    <input type="color" value={safeColor(nodeStyle.borderColor)} onChange={(e) => handleChange('borderColor', e.target.value)} />
                </div>

                <div className={styles.group}>
                    <label className={styles.label}>Цвет текста:</label>
                    <input type="color" value={safeColor(textStyle.color)} onChange={(e) => handleChange('color', e.target.value, true)} />
                </div>

                <div className={styles.group}>
                    <label className={styles.label}>Размер текста:</label>
                    <input
                        type="number"
                        value={parseInt(textStyle.fontSize || 14)}
                        onChange={(e) => handleChange('fontSize', `${e.target.value}px`, true)}
                        className={styles.input}
                    />
                </div>
            </div>
        );
    };

    const renderEdgeProperties = () => {
        if (!selectedEdge) return null;

        const edgeStyle = selectedEdge.style || {};
        const handleChange = (key, value) => onEdgeChange(selectedEdge.id, { [key]: value });
        const handleMarkerChange = (pos, value) => handleChange(pos, value);

        return (
            <div className={styles.propertiesSection}>
                <h3 className={styles.sectionTitle}>Свойства связи</h3>

                <div className={styles.group}>
                    <label className={styles.label}>Тип линии:</label>
                    <select value={selectedEdge.type || 'smoothstep'} onChange={(e) => handleChange('type', e.target.value)} className={styles.select}>
                        <option value="straight">Прямая</option>
                        <option value="smoothstep">С изломом</option>
                        <option value="bezier">Плавная</option>
                    </select>
                </div>

                <div className={styles.group}>
                    <label className={styles.label}>Стиль:</label>
                    <select
                        value={edgeStyle.strokeDasharray || '0'}
                        onChange={(e) => handleChange('style', { ...edgeStyle, strokeDasharray: e.target.value })}
                        className={styles.select}
                    >
                        <option value="0">Сплошная</option>
                        <option value="5 5">Пунктир</option>
                    </select>
                </div>

                <div className={styles.group}>
                    <label className={styles.label}>Цвет:</label>
                    <input
                        type="color"
                        value={safeColor(edgeStyle.stroke)}
                        onChange={(e) => handleChange('style', { ...edgeStyle, stroke: e.target.value })}
                    />
                </div>

                <div className={styles.group}>
                    <label className={styles.label}>Начало:</label>
                    <select
                        value={getMarkerId(selectedEdge.markerStart)}
                        onChange={(e) => handleMarkerChange('markerStart', e.target.value)}
                        className={styles.select}
                    >
                        {MARKER_OPTIONS.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                    </select>
                </div>

                <div className={styles.group}>
                    <label className={styles.label}>Конец:</label>
                    <select
                        value={getMarkerId(selectedEdge.markerEnd)}
                        onChange={(e) => handleMarkerChange('markerEnd', e.target.value)}
                        className={styles.select}
                    >
                        {MARKER_OPTIONS.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                    </select>
                </div>
            </div>
        );
    };

    const containerClasses = [
        styles.container,
        isOpen ? styles.containerOpen : styles.containerClosed
    ].join(' ');

    return (
        <aside className={containerClasses}>
            <button onClick={onToggle} className={styles.toggleBtn}>
                {isOpen ? '▶' : '◀'}
            </button>

            {isOpen && (
                <div className={styles.contentWrapper}>
                    {renderRoomInfo()}
                    {renderGlobalSettings()}

                    <div className={styles.divider}></div>

                    <div className={styles.scrollArea}>
                        {renderNodeProperties()}
                        {renderEdgeProperties()}

                        {!selectedNode && !selectedEdge && (
                            <p className={styles.hint}>Выберите элемент на холсте для редактирования</p>
                        )}
                    </div>
                </div>
            )}
        </aside>
    );
};

export default Inspector;