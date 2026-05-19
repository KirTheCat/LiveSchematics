import React, { useRef } from 'react';

const Header = ({ onSave, onLoad, onUndo, onRedo }) => {
    const fileInputRef = useRef(null);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file && onLoad) {
            onLoad(file);
            event.target.value = null;
        }
    };

    return (
        <header style={styles.header}>
            <div style={styles.logoSection}>
                <svg width="40" height="40" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: '8px' }}>
                    <defs>
                        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#3B82F6"/>
                            <stop offset="50%" stopColor="#8B5CF6"/>
                            <stop offset="100%" stopColor="#F97316"/>
                        </linearGradient>
                    </defs>
                    <rect x="0" y="0" width="256" height="256" rx="40" fill="url(#bgGradient)" />
                    <g stroke="#FFFFFF" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="80" y1="80" x2="176" y2="80" />
                        <line x1="176" y1="80" x2="176" y2="144" />
                        <line x1="112" y1="160" x2="80" y2="128" />
                    </g>
                    <rect x="64" y="64" width="32" height="32" rx="4" fill="#3B82F6" />
                    <circle cx="176" cy="80" r="18" fill="#F97316" />
                    <rect x="128" y="144" width="64" height="32" rx="6" fill="#22C55E" />
                    <polygon points="80,112 96,128 80,144 64,128" fill="#EF4444" />
                    <g transform="translate(120,110) rotate(-25)">
                        <rect x="0" y="0" width="70" height="8" rx="4" fill="#FACC15" />
                        <polygon points="70,0 84,4 70,8" fill="#F97316" />
                        <rect x="-6" y="0" width="6" height="8" fill="#111827" />
                    </g>
                </svg>

                <span style={styles.title}>
                    <span style={{ color: '#3B82F6' }}>Live</span>
                    <span style={{ color: '#333' }}>Schematics</span>
                </span>
            </div>

            <div style={styles.actions}>
                {/* Undo Button */}
                <button onClick={onUndo} style={styles.btnIcon} title="Отменить (Ctrl+Z)">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 7v6h6" />
                        <path d="M21 17a9 9 0 00-9-9 9 9 0 00-6.36 2.64L3 13" />
                    </svg>
                </button>

                {/* Redo Button */}
                <button onClick={onRedo} style={styles.btnIcon} title="Вернуть (Ctrl+Y)">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 7v6h-6" />
                        <path d="M3 17a9 9 0 019-9 9 9 0 016.36 2.64L21 13" />
                    </svg>
                </button>

                <div style={{ width: 1, height: 24, background: '#e0e0e0', margin: '0 10px' }} />

                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept=".json,application/json"
                    onChange={handleFileChange}
                />

                <button onClick={onSave} style={styles.btn}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px' }}>
                        <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                        <polyline points="17,21 17,13 7,13 7,21" />
                        <polyline points="7,3 7,8 15,8" />
                    </svg>
                    Сохранить
                </button>

                <button onClick={() => fileInputRef.current.click()} style={styles.btnSecondary}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px' }}>
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                        <polyline points="17,8 12,3 7,8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    Загрузить
                </button>
            </div>
        </header>
    );
};

const styles = {
    header: {
        height: '60px',
        background: '#fff',
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        boxSizing: 'border-box',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        zIndex: 100,
        flexShrink: 0
    },
    logoSection: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
    },
    title: {
        fontSize: '20px',
        fontWeight: 'bold',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        letterSpacing: '0.5px'
    },
    actions: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
    },
    btn: {
        display: 'flex',
        alignItems: 'center',
        padding: '8px 16px',
        background: '#007bff',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: '500',
        fontSize: '14px',
        transition: 'background 0.2s'
    },
    btnSecondary: {
        display: 'flex',
        alignItems: 'center',
        padding: '8px 16px',
        background: '#fff',
        color: '#333',
        border: '1px solid #ccc',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: '500',
        fontSize: '14px',
        transition: 'background 0.2s'
    },
    btnIcon: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '36px',
        height: '36px',
        background: 'transparent',
        color: '#555',
        border: '1px solid #ddd',
        borderRadius: '6px',
        cursor: 'pointer',
        transition: 'all 0.2s'
    }
};

export default Header;