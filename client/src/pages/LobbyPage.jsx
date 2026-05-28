import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { socket } from '../hooks/useDiagram/useSync';

const LobbyPage = () => {
    const [rooms, setRooms] = useState([]);
    const [username, setUsername] = useState('');
    const [newRoomName, setNewRoomName] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const [mode, setMode] = useState('create');
    const [joinId, setJoinId] = useState('');
    const [usePassword, setUsePassword] = useState(false);
    const [password, setPassword] = useState('');
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [targetRoomId, setTargetRoomId] = useState(null);
    const [modalError, setModalError] = useState('');

    const fetchRooms = async () => {
        try {
            const res = await axios.get('http://localhost:3001/api/rooms');
            setRooms(res.data);
        } catch (err) {
            console.error("Failed to fetch rooms");
        }
    };

    useEffect(() => {
        fetchRooms();

        socket.on('rooms-updated', fetchRooms);

        return () => {
            socket.off('rooms-updated');
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username.trim()) return alert("Введите имя пользователя!");
        if (mode === 'create') {
            await handleCreateRoom();
        } else {
            await handleJoinRoom(joinId);
        }
    };

    const handleCreateRoom = async () => {
        setLoading(true);
        try {
            const roomId = `room-${Date.now().toString(36)}`;
            await axios.post('http://localhost:3001/api/rooms', {
                roomId,
                roomName: newRoomName || `Комната ${rooms.length + 1}`,
                creatorName: username,
                password: usePassword ? password : null
            });
            navigate(`/room/${roomId}`, { state: { username, roomName: newRoomName } });
        } catch (err) {
            alert("Ошибка при создании комнаты");
        } finally {
            setLoading(false);
        }
    };

    const handleJoinRoom = async (id) => {
        if (!id) return alert("Введите ID комнаты!");

        try {
            const checkRes = await axios.post('http://localhost:3001/api/rooms/verify', { roomId: id, password: '' });
            if (checkRes.data.success) {
                proceedToRoom(id);
            }
        } catch (err) {
            if (err.response && err.response.status === 401) {
                setTargetRoomId(id);
                setShowPasswordModal(true);
                setModalError('');
            } else if (err.response && err.response.status === 404) {
                alert("Комната не найдена");
            } else {
                alert("Ошибка проверки комнаты");
            }
        }
    };

    const handlePasswordSubmit = async () => {
        try {
            await axios.post('http://localhost:3001/api/rooms/verify', { roomId: targetRoomId, password });
            proceedToRoom(targetRoomId);
        } catch (err) {
            setModalError("Неверный пароль");
        }
    };

    const proceedToRoom = (id) => {
        const room = rooms.find(r => r.roomId === id);
        navigate(`/room/${id}`, { state: { username, roomName: room?.roomName } });
    };

    return (
        <div style={styles.pageWrapper}>
            <div style={styles.container}>
                {/* Логотип и Заголовок */}
                <div style={styles.logoSection}>
                    {/* НОВЫЙ ЛОГОТИП (уменьшенный) */}
                    <svg width="60" height="60" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
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
                    <div style={styles.titleContainer}>
                        <span style={styles.title}><span style={{ color: '#3B82F6' }}>Live</span><span style={{ color: '#333' }}>Schematics</span></span>
                        <span style={styles.subtitle}>Совместное моделирование в реальном времени</span>
                    </div>
                </div>

                {/* Карточка входа */}
                <div style={styles.card}>
                    <form onSubmit={handleSubmit}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Ваше имя</label>
                            <input
                                style={styles.input}
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Как вас зовут?"
                            />
                        </div>

                        <div style={styles.switcher}>
                            <button type="button" style={mode === 'create' ? styles.switchBtnActive : styles.switchBtn} onClick={() => setMode('create')}>Создать</button>
                            <button type="button" style={mode === 'join' ? styles.switchBtnActive : styles.switchBtn} onClick={() => setMode('join')}>Подключиться</button>
                        </div>

                        {mode === 'create' ? (
                            <>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Название комнаты (необязательно)</label>
                                    <div style={styles.createRow}>
                                        <input
                                            style={{...styles.input, flex: 1}}
                                            type="text"
                                            value={newRoomName}
                                            onChange={(e) => setNewRoomName(e.target.value)}
                                            placeholder="Мой проект"
                                        />
                                        <button
                                            style={styles.createBtn}
                                            type="submit"
                                            disabled={loading}
                                        >
                                            {loading ? '...' : 'Создать'}
                                        </button>
                                    </div>
                                </div>

                                <div style={styles.checkboxRow}>
                                    <input
                                        type="checkbox"
                                        checked={usePassword}
                                        onChange={(e) => setUsePassword(e.target.checked)}
                                        id="passCheck"
                                    />
                                    <label htmlFor="passCheck" style={{cursor: 'pointer', userSelect: 'none'}}>Закрыть паролем</label>
                                </div>

                                {usePassword && (
                                    <div style={styles.inputGroup}>
                                        <input
                                            type="password"
                                            style={styles.input}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Введите пароль"
                                        />
                                    </div>
                                )}
                            </>
                        ) : (
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>ID Комнаты</label>
                                <div style={styles.createRow}>
                                    <input
                                        style={{...styles.input, flex: 1}}
                                        type="text"
                                        value={joinId}
                                        onChange={(e) => setJoinId(e.target.value)}
                                        placeholder="Вставьте ID комнаты"
                                    />
                                    <button
                                        style={styles.createBtn}
                                        type="submit"
                                        disabled={loading}
                                    >
                                        Войти
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                {/* Список комнат */}
                <div style={styles.listContainer}>
                    <div style={styles.listHeader}>
                        <h3 style={styles.listTitle}>Активные комнаты</h3>
                        <button style={styles.refreshBtn} onClick={fetchRooms} title="Обновить список">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M23 4v6h-6"></path>
                                <path d="M1 20v-6h6"></path>
                                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" stroke="#555"></path>
                            </svg>
                        </button>
                    </div>

                    <div style={styles.roomList}>
                        {rooms.length === 0 && (
                            <div style={styles.emptyState}>
                                <span role="img" aria-label="emoji" style={{fontSize: '24px'}}>🚫</span>
                                <p>Нет активных комнат. Создайте первую!</p>
                            </div>
                        )}
                        {rooms.map(room => (
                            <div key={room.roomId} style={styles.roomItem} onClick={() => handleJoinRoom(room.roomId)}>
                                <div style={styles.roomInfo}>
                                    <div style={styles.roomName}>
                                        {room.roomName}
                                        {room.hasPassword && <span style={styles.lockIcon} title="Закрытая комната"> 🔒</span>}
                                    </div>
                                    <div style={styles.roomMeta}>
                                        <span>{room.userCount} участников</span>
                                        {room.hasPassword && <span style={{color: '#ffc107'}}>• Закрытая</span>}
                                    </div>
                                </div>
                                <button style={styles.joinBtn}>
                                    Войти
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Модальное окно пароля */}
            {showPasswordModal && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modal}>
                        <h3>🔒 Комната закрыта</h3>
                        <p style={{color: '#666', fontSize: 14}}>Введите пароль для входа</p>
                        <input
                            type="password"
                            style={styles.input}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Пароль"
                            autoFocus
                        />
                        {modalError && <p style={{color: 'red', fontSize: 12, marginTop: 5}}>{modalError}</p>}
                        <div style={styles.modalActions}>
                            <button style={styles.cancelBtn} onClick={() => setShowPasswordModal(false)}>Отмена</button>
                            <button style={styles.confirmBtn} onClick={handlePasswordSubmit}>Войти</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    pageWrapper: { minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', fontFamily: 'system-ui, sans-serif', color: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    container: { width: '100%', maxWidth: '480px', padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '24px' },
    logoSection: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '10px', justifyContent: 'center' },
    titleContainer: { display: 'flex', flexDirection: 'column' },
    title: { fontSize: '28px', fontWeight: 'bold', letterSpacing: '-0.5px' },
    subtitle: { fontSize: '14px', color: '#666', marginTop: '4px' },
    card: { background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
    inputGroup: { marginBottom: '16px' },
    label: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#555', marginBottom: '8px' },
    input: { width: '100%', padding: '12px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '15px', outline: 'none', boxSizing: 'border-box' },
    switcher: { display: 'flex', gap: '10px', marginBottom: '20px' },
    switchBtn: { flex: 1, padding: 10, border: '1px solid #ddd', background: '#fff', borderRadius: 8, cursor: 'pointer', fontWeight: 500, color: '#666' },
    switchBtnActive: { flex: 1, padding: 10, border: '1px solid #007bff', background: '#e7f1ff', borderRadius: 8, cursor: 'pointer', fontWeight: 600, color: '#007bff' },
    createRow: { display: 'flex', gap: '10px' },
    createBtn: { padding: '0 24px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '15px', whiteSpace: 'nowrap' },
    checkboxRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, marginTop: 8 },
    listContainer: { background: '#fff', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden' },
    listHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #f0f0f0' },
    listTitle: { margin: 0, fontSize: '16px', fontWeight: '600' },
    refreshBtn: { background: '#f0f2f5', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s' },
    roomList: { maxHeight: '240px', overflowY: 'auto' },
    roomItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid #f5f5f5', transition: 'background 0.2s', cursor: 'pointer' },
    roomInfo: { display: 'flex', flexDirection: 'column', gap: '4px' },
    roomName: { fontWeight: '600', fontSize: '15px' },
    roomMeta: { fontSize: '12px', color: '#888' },
    lockIcon: { fontSize: 14 },
    joinBtn: { padding: '6px 16px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' },
    emptyState: { padding: '30px', textAlign: 'center', color: '#999', fontSize: '14px' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modal: { background: '#fff', padding: 25, borderRadius: 10, width: 350, boxShadow: '0 4px 15px rgba(0,0,0,0.2)' },
    modalActions: { marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 10 },
    cancelBtn: { padding: '8px 16px', border: '1px solid #ccc', background: '#fff', borderRadius: 6, cursor: 'pointer' },
    confirmBtn: { padding: '8px 16px', border: 'none', background: '#007bff', color: '#fff', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold' }
};

export default LobbyPage;