// src/pages/Home.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();
    const [mode, setMode] = useState('create');
    const [username, setUsername] = useState('');
    const [roomName, setRoomName] = useState('');
    const [roomId, setRoomId] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!username.trim()) return alert('Введите имя!');

        if (mode === 'create') {
            const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
            navigate(`/room/${newRoomId}`, {
                state: {
                    username,
                    roomName: roomName || 'Новая схема',
                    isNew: true
                }
            });
        } else {
            if (!roomId.trim()) return alert('Введите ID комнаты!');
            navigate(`/room/${roomId}`, {
                state: {
                    username,
                    isNew: false
                }
            });
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.title}>Diagram App</h1>

                <div style={styles.switchContainer}>
                    <button
                        style={mode === 'create' ? styles.activeTab : styles.tab}
                        onClick={() => setMode('create')}
                    >
                        Создать
                    </button>
                    <button
                        style={mode === 'join' ? styles.activeTab : styles.tab}
                        onClick={() => setMode('join')}
                    >
                        Подключиться
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <input
                        style={styles.input}
                        type="text"
                        placeholder="Ваше имя"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />

                    {mode === 'create' ? (
                        <input
                            style={styles.input}
                            type="text"
                            placeholder="Название схемы (необязательно)"
                            value={roomName}
                            onChange={(e) => setRoomName(e.target.value)}
                        />
                    ) : (
                        <input
                            style={styles.input}
                            type="text"
                            placeholder="ID комнаты"
                            value={roomId}
                            onChange={(e) => setRoomId(e.target.value)}
                            required
                        />
                    )}

                    <button type="submit" style={styles.button}>
                        {mode === 'create' ? 'Создать комнату' : 'Подключиться'}
                    </button>
                </form>
            </div>
        </div>
    );
};

const styles = {
    container: {
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f0f2f5',
        fontFamily: 'sans-serif'
    },
    card: {
        background: 'white',
        padding: '40px',
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        width: '350px'
    },
    title: {
        textAlign: 'center',
        marginBottom: '20px',
        color: '#333'
    },
    switchContainer: {
        display: 'flex',
        marginBottom: '20px',
        background: '#eee',
        borderRadius: '5px',
        padding: '5px'
    },
    tab: {
        flex: 1,
        border: 'none',
        background: 'transparent',
        padding: '10px',
        cursor: 'pointer',
        borderRadius: '5px',
        fontWeight: 'bold',
        color: '#666'
    },
    activeTab: {
        flex: 1,
        border: 'none',
        background: 'white',
        padding: '10px',
        cursor: 'pointer',
        borderRadius: '5px',
        fontWeight: 'bold',
        color: '#007bff',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
    },
    input: {
        padding: '12px',
        border: '1px solid #ddd',
        borderRadius: '5px',
        fontSize: '14px'
    },
    button: {
        padding: '12px',
        background: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        fontSize: '16px',
        cursor: 'pointer',
        fontWeight: 'bold'
    }
};

export default Home;