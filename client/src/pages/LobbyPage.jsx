/* src/pages/LobbyPage*/
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../hooks/useDiagram/useSync';
import { roomApi } from '../api/roomApi';
import { Logo } from '../components/Lobby/Logo';
import { RoomList } from '../components/Lobby/RoomList';
import styles from '../components/Lobby/LobbyPage.module.css';

const LobbyPage = () => {

    const [rooms, setRooms] = useState([]);
    const [username, setUsername] = useState('');
    const [newRoomName, setNewRoomName] = useState('');
    const [loading, setLoading] = useState(false);

    const [mode, setMode] = useState('create');
    const [joinId, setJoinId] = useState('');

    const [usePassword, setUsePassword] = useState(false);
    const [password, setPassword] = useState('');
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [targetRoomId, setTargetRoomId] = useState(null);
    const [modalError, setModalError] = useState('');

    const navigate = useNavigate();

    const fetchRooms = useCallback(async () => {
        try {
            const data = await roomApi.getRooms();
            setRooms(data);
        } catch (err) {
            console.error("Failed to fetch rooms", err);
        }
    }, []);

    useEffect(() => {
        fetchRooms();
        socket.on('rooms-updated', fetchRooms);
        return () => socket.off('rooms-updated');
    }, [fetchRooms]);

    const proceedToRoom = (id) => {
        const room = rooms.find(r => r.roomId === id);
        navigate(`/room/${id}`, { state: { username, roomName: room?.roomName } });
    };

    const handleJoinRoom = async (id) => {
        if (!username.trim()) return alert("Введите имя пользователя!");
        if (!id) return alert("Введите ID комнаты!");

        try {
            await roomApi.verifyRoom(id, '');
            proceedToRoom(id);
        } catch (err) {
            if (err.response?.status === 401) {
                setTargetRoomId(id);
                setShowPasswordModal(true);
                setModalError('');
            } else if (err.response?.status === 404) {
                alert("Комната не найдена");
            } else {
                alert("Ошибка проверки комнаты");
            }
        }
    };

    const handleCreateRoom = async () => {
        if (!username.trim()) return alert("Введите имя пользователя!");
        setLoading(true);
        try {
            const roomId = `room-${Date.now().toString(36)}`;
            await roomApi.createRoom(
                roomId,
                newRoomName || `Комната ${rooms.length + 1}`,
                username,
                usePassword ? password : null
            );
            navigate(`/room/${roomId}`, { state: { username, roomName: newRoomName } });
        } catch (err) {
            alert("Ошибка при создании комнаты");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (mode === 'create') {
            handleCreateRoom();
        } else {
            handleJoinRoom(joinId);
        }
    };

    const handlePasswordSubmit = async () => {
        try {
            await roomApi.verifyRoom(targetRoomId, password);
            proceedToRoom(targetRoomId);
            setShowPasswordModal(false);
        } catch (err) {
            setModalError("Неверный пароль");
        }
    };

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.container}>

                <div className={styles.logoSection}>
                    <Logo />
                    <div>
                        <span className={styles.title}>
                            <span className={styles.titleLive}>Live</span>
                            <span className={styles.titleRest}>Schematics</span>
                        </span>
                        <div className={styles.subtitle}>Совместное моделирование в реальном времени</div>
                    </div>
                </div>

                <div className={styles.card}>
                    <form onSubmit={handleSubmit}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Ваше имя</label>
                            <input
                                className={styles.input}
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Как вас зовут?"
                            />
                        </div>

                        <div className={styles.switcher}>
                            <button
                                type="button"
                                className={mode === 'create' ? styles.switchBtnActive : styles.switchBtn}
                                onClick={() => setMode('create')}
                            >
                                Создать
                            </button>
                            <button
                                type="button"
                                className={mode === 'join' ? styles.switchBtnActive : styles.switchBtn}
                                onClick={() => setMode('join')}
                            >
                                Подключиться
                            </button>
                        </div>

                        {mode === 'create' ? (
                            <>
                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>Название комнаты (необязательно)</label>
                                    <div className={styles.createRow}>
                                        <input
                                            className={styles.input}
                                            style={{ flex: 1 }}
                                            type="text"
                                            value={newRoomName}
                                            onChange={(e) => setNewRoomName(e.target.value)}
                                            placeholder="Мой проект"
                                        />
                                        <button className={styles.createBtn} type="submit" disabled={loading}>
                                            {loading ? '...' : 'Создать'}
                                        </button>
                                    </div>
                                </div>

                                <div className={styles.checkboxRow}>
                                    <input
                                        type="checkbox"
                                        checked={usePassword}
                                        onChange={(e) => setUsePassword(e.target.checked)}
                                        id="passCheck"
                                    />
                                    <label htmlFor="passCheck">Закрыть паролем</label>
                                </div>

                                {usePassword && (
                                    <div className={styles.inputGroup} style={{ marginBottom: 0 }}>
                                        <input
                                            type="password"
                                            className={styles.input}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Введите пароль"
                                        />
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>ID Комнаты</label>
                                <div className={styles.createRow}>
                                    <input
                                        className={styles.input}
                                        style={{ flex: 1 }}
                                        type="text"
                                        value={joinId}
                                        onChange={(e) => setJoinId(e.target.value)}
                                        placeholder="Вставьте ID комнаты"
                                    />
                                    <button className={styles.createBtn} type="submit" disabled={loading}>
                                        Войти
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
                <>
                    <div className={styles.listContainer} style={{ borderBottom: 'none', paddingBottom: 0 }}>
                        <div className={styles.listHeader}>
                            <h3 className={styles.listTitle}>Активные комнаты</h3>
                            <button className={styles.refreshBtn} onClick={fetchRooms} title="Обновить список">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M23 4v6h-6"></path>
                                    <path d="M1 20v-6h6"></path>
                                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" stroke="#555"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div style={{ marginTop: '-1px' }}>
                        <RoomList rooms={rooms} onJoin={handleJoinRoom} />
                    </div>
                </>
            </div>

            {showPasswordModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h3>🔒 Комната закрыта</h3>
                        <p style={{ color: '#666', fontSize: 14 }}>Введите пароль для входа</p>
                        <input
                            type="password"
                            className={styles.input}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Пароль"
                            autoFocus
                        />
                        {modalError && <p style={{ color: 'red', fontSize: 12, marginTop: 5 }}>{modalError}</p>}
                        <div className={styles.modalActions}>
                            <button className={styles.cancelBtn} onClick={() => setShowPasswordModal(false)}>Отмена</button>
                            <button className={styles.confirmBtn} onClick={handlePasswordSubmit}>Войти</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LobbyPage;