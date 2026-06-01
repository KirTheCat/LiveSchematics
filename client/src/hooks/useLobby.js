// src/hooks/useLobby.js
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from './useDiagram/useSync';
import { roomApi } from '../api/roomApi';

export const useLobby = () => {
    const navigate = useNavigate();

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
        if (mode === 'create') handleCreateRoom();
        else handleJoinRoom(joinId);
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

    return {
        rooms,
        username, setUsername,
        newRoomName, setNewRoomName,
        loading,
        mode, setMode,
        joinId, setJoinId,
        usePassword, setUsePassword,
        password, setPassword,
        showPasswordModal, setShowPasswordModal,
        modalError,
        handleSubmit,
        handleJoinRoom,
        handlePasswordSubmit,
        fetchRooms
    };
};