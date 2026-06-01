import React, { useRef } from 'react';
import styles from './Header.module.css';
import { Logo } from '../Logo';

const Icons = {
    Save: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px' }}>
            <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
            <polyline points="17,21 17,13 7,13 7,21" />
            <polyline points="7,3 7,8 15,8" />
        </svg>
    ),
    Load: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px' }}>
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="17,8 12,3 7,8" />
            <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
    )
};

const Header = ({ onSave, onLoad, onUndo, onRedo, onLeave }) => {
    const fileInputRef = useRef(null);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file && onLoad) {
            onLoad(file);
            event.target.value = null;
        }
    };

    return (
        <header className={styles.header}>
            <div className={styles.logoSection}>
                <Logo size={40} />
                <span className={styles.title}>
                    <span style={{ color: '#3B82F6' }}>Live</span>
                    <span style={{ color: '#333' }}>Schematics</span>
                </span>
            </div>

            <div className={styles.actions}>
                <button onClick={onLeave} className={styles.btnExit}>
                    ← Выход
                </button>

                <div className={styles.divider} />

                <button onClick={onUndo} className={styles.btnIcon} title="Отменить (Ctrl+Z)">
                    ↶
                </button>
                <button onClick={onRedo} className={styles.btnIcon} title="Повторить (Ctrl+Y)">
                    ↷
                </button>

                <div className={styles.divider} />

                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept=".json,application/json"
                    onChange={handleFileChange}
                />

                <button onClick={onSave} className={styles.btn}>
                    <Icons.Save />
                    Сохранить
                </button>

                <button onClick={() => fileInputRef.current.click()} className={styles.btnSecondary}>
                    <Icons.Load />
                    Загрузить
                </button>
            </div>
        </header>
    );
};

export default Header;