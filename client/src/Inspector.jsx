// Inspector.jsx
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
        width: isOpen ? '250px' : '40px',
        background: '#fff',
        borderLeft: '1px solid #ddd',
        transition: 'width 0.2s ease-in-out',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        height: '100%'
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
        <div style={{ padding: '10px 15px', borderBottom: '1px solid #ddd', background: '#f0f8ff' }}>
            <h4 style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#333' }}>
                {roomInfo?.roomName || 'Загрузка...'}
            </h4>
            <div style={{ fontSize: '11px', color: '#666', display: 'flex', justifyContent: 'space-between' }}>
                <span>ID: {roomInfo?.roomId}</span>
                <span>Создатель: {roomInfo?.creatorName}</span>
            </div>
        </div>
    );

    const renderGlobalSettings = () => (
        <div style={{ padding: '10px 15px', borderBottom: '1px solid #ddd', background: '#f9f9f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', color: '#333' }}>
                    Показать точки связей
                </span>

                <div
                    onClick={onToggleHandles}
                    style={{
                        width: '40px',
                        height: '20px',
                        backgroundColor: showHandles ? '#007bff' : '#ccc',
                        borderRadius: '10px',
                        position: 'relative',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                    }}
                >
                    <div style={{
                        width: '16px',
                        height: '16px',
                        backgroundColor: 'white',
                        borderRadius: '50%',
                        position: 'absolute',
                        top: '2px',
                        left: showHandles ? '22px' : '2px',
                        transition: 'left 0.2s',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                    }} />
                </div>
            </div>
        </div>
    );

    // --- Рендер для Узла ---
    if (selectedNode) {
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
            <aside style={containerStyle}>
                <button onClick={onToggle} style={styles.toggleBtn}>{isOpen ? '▶' : '◀'}</button>

                {isOpen && (
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

                        {roomInfo && renderRoomInfo()}
                        {renderGlobalSettings()}

                        <div style={{ padding: '15px', flex: 1, overflowY: 'auto' }}>
                            <h3 style={styles.title}>Свойства фигуры</h3>

                            <div style={styles.group}>
                                <label style={styles.label}>Цвет фона:</label>
                                <input type="color" value={nodeStyle.background || '#ffffff'} onChange={(e) => handleChange('background', e.target.value)} />
                            </div>

                            <div style={styles.group}>
                                <label style={styles.label}>Цвет границы:</label>
                                <input type="color" value={nodeStyle.borderColor || '#555555'} onChange={(e) => handleChange('borderColor', e.target.value)} />
                            </div>

                            <div style={styles.group}>
                                <label style={styles.label}>Цвет текста:</label>
                                <input type="color" value={textStyle.color || '#000000'} onChange={(e) => handleChange('color', e.target.value, true)} />
                            </div>

                            <div style={styles.group}>
                                <label style={styles.label}>Размер текста:</label>
                                <input type="number" value={parseInt(textStyle.fontSize || 14)} onChange={(e) => handleChange('fontSize', `${e.target.value}px`, true)} style={styles.input} />
                            </div>
                        </div>
                    </div>
                )}
            </aside>
        );
    }

    // --- Рендер для Связи ---
    if (selectedEdge) {
        const edgeStyle = selectedEdge.style || {};

        const handleChange = (key, value) => onEdgeChange(selectedEdge.id, { [key]: value });
        const handleMarkerChange = (pos, value) => handleChange(pos, value);

        return (
            <aside style={containerStyle}>
                <button onClick={onToggle} style={styles.toggleBtn}>{isOpen ? '▶' : '◀'}</button>
                {isOpen && (
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        {renderGlobalSettings()}
                        <div style={{ padding: '15px', flex: 1, overflowY: 'auto' }}>
                            <h3 style={styles.title}>Свойства связи</h3>
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
                                <input type="color" value={edgeStyle.stroke || '#333'} onChange={(e) => handleChange('style', { ...edgeStyle, stroke: e.target.value })} />
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
                    </div>
                )}
            </aside>
        );
    }

    // --- Пустое состояние ---
    return (
        <aside style={containerStyle}>
            <button onClick={onToggle} style={styles.toggleBtn}>{isOpen ? '▶' : '◀'}</button>
            {isOpen && (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    {renderGlobalSettings()}
                    <p style={{ ...styles.hint, textAlign: 'center', padding: '20px' }}>Выберите элемент</p>
                </div>
            )}
        </aside>
    );
};

const styles = {
    toggleBtn: { position: 'absolute', top: '10px', left: '10px', border: 'none', background: '#f0f0f0', cursor: 'pointer', borderRadius: '4px', width: '25px', height: '25px', padding: 0, fontSize: '12px', zIndex: 10 },
    title: { marginTop: '0', marginBottom: '20px', fontSize: '16px', fontWeight: 'bold' },
    group: { marginBottom: '15px', display: 'flex', flexDirection: 'column', gap: '5px' },
    label: { fontSize: '12px', color: '#666' },
    input: { padding: '5px', border: '1px solid #ccc', borderRadius: '4px' },
    select: { padding: '5px', border: '1px solid #ccc', borderRadius: '4px' },
    hint: { fontSize: '11px', color: '#999', marginTop: '10px' }
};

export default Inspector;