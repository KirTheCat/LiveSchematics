import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LobbyPage = () => {
    const [rooms, setRooms] = useState([]);
    const [username, setUsername] = useState('');
    const [newRoomName, setNewRoomName] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

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
    }, []);

    const handleCreateRoom = async () => {
        if (!username) return alert("Введите имя пользователя!");
        setLoading(true);
        try {
            const roomId = `room-${Date.now().toString(36)}`;
            await axios.post('http://localhost:3001/api/rooms', {
                roomId,
                roomName: newRoomName || `Комната ${rooms.length + 1}`,
                creatorName: username
            });
            navigate(`/room/${roomId}`, { state: { username, roomName: newRoomName } });
        } catch (err) {
            alert("Ошибка при создании комнаты");
        } finally {
            setLoading(false);
        }
    };

    const handleJoinRoom = (room) => {
        if (!username) return alert("Введите имя пользователя!");
        navigate(`/room/${room.roomId}`, { state: { username, roomName: room.roomName } });
    };

    return (
        <div style={styles.pageWrapper}>
            <div style={styles.container}>
                <div style={styles.logoSection}>
                    <svg width="60" height="60" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                        <defs><linearGradient id="bgGradientLobby" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#3B82F6"/><stop offset="50%" stopColor="#8B5CF6"/><stop offset="100%" stopColor="#F97316"/></linearGradient></defs>
                        <rect x="0" y="0" width="256" height="256" rx="40" fill="url(#bgGradientLobby)" />
                        <g stroke="#FFFFFF" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round"><line x1="80" y1="80" x2="176" y2="80" /><line x1="176" y1="80" x2="176" y2="144" /><line x1="112" y1="160" x2="80" y2="128" /></g>
                        <rect x="64" y="64" width="32" height="32" rx="4" fill="#3B82F6" /><circle cx="176" cy="80" r="18" fill="#F97316" /><rect x="128" y="144" width="64" height="32" rx="6" fill="#22C55E" /><polygon points="80,112 96,128 80,144 64,128" fill="#EF4444" />
                    </svg>
                    <div style={styles.titleContainer}>
                        <span style={styles.title}><span style={{ color: '#3B82F6' }}>Live</span><span style={{ color: '#333' }}>Schematics</span></span>
                        <span style={styles.subtitle}>Совместное моделирование в реальном времени</span>
                    </div>
                </div>

                <div style={styles.card}>
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
                                onClick={handleCreateRoom}
                                disabled={loading}
                            >
                                {loading ? '...' : 'Создать комнату'}
                            </button>
                        </div>
                    </div>
                </div>

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
                            <div key={room.roomId} style={styles.roomItem}>
                                <div style={styles.roomInfo}>
                                    <div style={styles.roomName}>{room.roomName}</div>
                                    <div style={styles.roomMeta}>
                                        <span>{room.userCount} участников</span>
                                        <span style={{marginLeft: '10px'}}>ID: {room.roomId.substring(0, 8)}...</span>
                                    </div>
                                </div>
                                <button style={styles.joinBtn} onClick={() => handleJoinRoom(room)}>
                                    Войти
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    pageWrapper: {
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#333'
    },
    container: {
        width: '100%',
        maxWidth: '480px',
        padding: '0 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
    },
    logoSection: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '10px',
        justifyContent: 'center'
    },
    titleContainer: {
        display: 'flex',
        flexDirection: 'column'
    },
    title: {
        fontSize: '28px',
        fontWeight: 'bold',
        letterSpacing: '-0.5px'
    },
    subtitle: {
        fontSize: '14px',
        color: '#666',
        marginTop: '4px'
    },
    card: {
        background: '#fff',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
    },
    inputGroup: {
        marginBottom: '16px',
        '&:last-child': { marginBottom: 0 }
    },
    label: {
        display: 'block',
        fontSize: '13px',
        fontWeight: '600',
        color: '#555',
        marginBottom: '8px'
    },
    input: {
        width: '100%',
        padding: '12px',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        fontSize: '15px',
        outline: 'none',
        transition: 'border-color 0.2s',
        boxSizing: 'border-box'
    },
    createRow: {
        display: 'flex',
        gap: '10px'
    },
    createBtn: {
        padding: '0 24px',
        background: '#007bff',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '15px',
        whiteSpace: 'nowrap'
    },
    listContainer: {
        background: '#fff',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        overflow: 'hidden'
    },
    listHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 20px',
        borderBottom: '1px solid #f0f0f0'
    },
    listTitle: {
        margin: 0,
        fontSize: '16px',
        fontWeight: '600'
    },
    refreshBtn: {
        background: '#f0f2f5',
        border: 'none',
        borderRadius: '50%',
        width: '32px',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'background 0.2s'
    },
    roomList: {
        maxHeight: '240px',
        overflowY: 'auto'
    },
    roomItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '14px 20px',
        borderBottom: '1px solid #f5f5f5',
        transition: 'background 0.2s'
    },
    roomInfo: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
    },
    roomName: {
        fontWeight: '600',
        fontSize: '15px'
    },
    roomMeta: {
        fontSize: '12px',
        color: '#888'
    },
    joinBtn: {
        padding: '6px 16px',
        background: '#28a745',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500'
    },
    emptyState: {
        padding: '30px',
        textAlign: 'center',
        color: '#999',
        fontSize: '14px'
    }
};

export default LobbyPage;