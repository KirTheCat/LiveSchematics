// src/Inspector.jsx
import React from 'react';

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

    const containerStyle = {
        width: isOpen ? '280px' : '40px',
        minWidth: isOpen ? '280px' : '40px',
        background: '#fff',
        borderLeft: '1px solid #ddd',
        transition: 'width 0.2s ease-in-out',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        height: '100%',
        overflow: 'hidden',
        boxSizing: 'border-box',
        zIndex: 10,
        flexShrink: 0
    };

    const getMarkerId = (marker) => {
        if (!marker) return '';
        if (typeof marker === 'string') {
            if (marker.startsWith('url(#')) return marker.substring(5, marker.length - 1);
            return marker;
        }
        return marker.type || '';
    };

    const renderRoomInfo = () => (
        <div style={styles.infoBlock}>
            <h4 style={styles.roomTitle} title={roomInfo?.roomName}>
                {roomInfo?.roomName || 'Загрузка...'}
            </h4>
            <div style={styles.roomDetails}>
                <span style={styles.detailItem}>
                    ID: <span style={styles.detailValue}>{roomInfo?.roomId || '...'}</span>
                </span>
                <span style={styles.detailItem}>
                    Создатель: <span style={styles.detailValue}>{roomInfo?.creatorName || '...'}</span>
                </span>
            </div>
        </div>
    );

    const renderGlobalSettings = () => (
        <div style={styles.settingsBlock}>
            <div style={styles.toggleRow}>
                <span style={styles.toggleLabel}>Показать точки связей</span>
                <div
                    onClick={onToggleHandles}
                    style={{
                        ...styles.switchTrack,
                        backgroundColor: showHandles ? '#007bff' : '#ccc'
                    }}
                >
                    <div style={{
                        ...styles.switchThumb,
                        left: showHandles ? '22px' : '2px'
                    }} />
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
            <div style={styles.propertiesSection}>
                <h3 style={styles.sectionTitle}>Свойства фигуры</h3>

                <div style={styles.group}>
                    <label style={styles.label}>Цвет фона:</label>
                    {/* Используем safeColor */}
                    <input type="color" value={safeColor(nodeStyle.background)} onChange={(e) => handleChange('background', e.target.value)} />
                </div>

                <div style={styles.group}>
                    <label style={styles.label}>Цвет границы:</label>
                    {/* Используем safeColor */}
                    <input type="color" value={safeColor(nodeStyle.borderColor)} onChange={(e) => handleChange('borderColor', e.target.value)} />
                </div>

                <div style={styles.group}>
                    <label style={styles.label}>Цвет текста:</label>
                    {/* Используем safeColor */}
                    <input type="color" value={safeColor(textStyle.color)} onChange={(e) => handleChange('color', e.target.value, true)} />
                </div>

                <div style={styles.group}>
                    <label style={styles.label}>Размер текста:</label>
                    <input type="number" value={parseInt(textStyle.fontSize || 14)} onChange={(e) => handleChange('fontSize', `${e.target.value}px`, true)} style={styles.input} />
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
            <div style={styles.propertiesSection}>
                <h3 style={styles.sectionTitle}>Свойства связи</h3>

                <div style={styles.group}>
                    <label style={styles.label}>Тип линии:</label>
                    <select value={selectedEdge.type || 'smoothstep'} onChange={(e) => handleChange('type', e.target.value)} style={styles.select}>
                        <option value="straight">Прямая</option>
                        <option value="smoothstep">С изломом</option>
                        <option value="bezier">Плавная</option>
                    </select>
                </div>

                <div style={styles.group}>
                    <label style={styles.label}>Стиль:</label>
                    <select value={edgeStyle.strokeDasharray || '0'} onChange={(e) => handleChange('style', { ...edgeStyle, strokeDasharray: e.target.value })} style={styles.select}>
                        <option value="0">Сплошная</option>
                        <option value="5 5">Пунктир</option>
                    </select>
                </div>

                <div style={styles.group}>
                    <label style={styles.label}>Цвет:</label>
                    <input type="color" value={safeColor(edgeStyle.stroke)} onChange={(e) => handleChange('style', { ...edgeStyle, stroke: e.target.value })} />
                </div>

                <div style={styles.group}>
                    <label style={styles.label}>Начало:</label>
                    <select value={getMarkerId(selectedEdge.markerStart)} onChange={(e) => handleMarkerChange('markerStart', e.target.value)} style={styles.select}>
                        {MARKER_OPTIONS.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                    </select>
                </div>

                <div style={styles.group}>
                    <label style={styles.label}>Конец:</label>
                    <select value={getMarkerId(selectedEdge.markerEnd)} onChange={(e) => handleMarkerChange('markerEnd', e.target.value)} style={styles.select}>
                        {MARKER_OPTIONS.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                    </select>
                </div>
            </div>
        );
    };

    return (
        <aside style={containerStyle}>

            <button onClick={onToggle} style={styles.toggleBtn}>
                {isOpen ? '▶' : '◀'}
            </button>

            {isOpen && (
                <div style={styles.contentWrapper}>

                    {renderRoomInfo()}
                    {renderGlobalSettings()}

                    <div style={styles.divider}></div>

                    <div style={styles.scrollArea}>
                        {renderNodeProperties()}
                        {renderEdgeProperties()}

                        {!selectedNode && !selectedEdge && (
                            <p style={styles.hint}>Выберите элемент на холсте для редактирования</p>
                        )}
                    </div>
                </div>
            )}
        </aside>
    );
};

const styles = {
    toggleBtn: {
        position: 'absolute',
        top: '10px',
        left: '10px',
        border: 'none',
        background: '#f0f0f0',
        cursor: 'pointer',
        borderRadius: '4px',
        width: '25px',
        height: '25px',
        padding: 0,
        fontSize: '12px',
        zIndex: 20,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    },
    contentWrapper: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        paddingTop: '40px',
        boxSizing: 'border-box',
        overflow: 'hidden'
    },
    infoBlock: {
        padding: '15px',
        borderBottom: '1px solid #eee',
        background: '#f9f9f9'
    },
    roomTitle: {
        margin: '0 0 10px 0',
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#333',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
    },
    roomDetails: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
    },
    detailItem: {
        fontSize: '12px',
        color: '#666',
        wordBreak: 'break-all'
    },
    detailValue: {
        fontWeight: '500',
        color: '#333'
    },
    settingsBlock: {
        padding: '15px',
        borderBottom: '1px solid #eee'
    },
    toggleRow: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '10px'
    },
    toggleLabel: {
        fontSize: '12px',
        color: '#333'
    },
    switchTrack: {
        width: '40px',
        height: '20px',
        borderRadius: '10px',
        position: 'relative',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        flexShrink: 0
    },
    switchThumb: {
        width: '16px',
        height: '16px',
        backgroundColor: 'white',
        borderRadius: '50%',
        position: 'absolute',
        top: '2px',
        transition: 'left 0.2s',
        boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
    },
    divider: {
        height: '10px',
        background: '#f0f2f5'
    },
    scrollArea: {
        flex: 1,
        overflowY: 'auto',
        padding: '15px'
    },
    propertiesSection: {
        marginBottom: '20px'
    },
    sectionTitle: {
        marginTop: '0',
        marginBottom: '15px',
        fontSize: '14px',
        fontWeight: 'bold',
        color: '#555'
    },
    group: {
        marginBottom: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '5px'
    },
    label: {
        fontSize: '12px',
        color: '#666'
    },
    input: {
        padding: '5px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        width: '100%',
        boxSizing: 'border-box'
    },
    select: {
        padding: '5px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        width: '100%',
        boxSizing: 'border-box'
    },
    hint: {
        fontSize: '12px',
        color: '#999',
        textAlign: 'center',
        marginTop: '20px'
    }
};

export default Inspector;