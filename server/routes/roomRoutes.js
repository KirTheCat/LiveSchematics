const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const userManager = require('../utils/userManager');

router.get('/', async (req, res) => {
    try {
        const activeRoomIds = userManager.getActiveRoomIds();
        if (activeRoomIds.length === 0) return res.json([]);

        const rooms = await Room.find({ roomId: { $in: activeRoomIds } }, 'roomId roomName creatorName hasPassword');

        const response = rooms.map(room => ({
            roomId: room.roomId,
            roomName: room.roomName,
            creatorName: room.creatorName,
            hasPassword: room.hasPassword,
            userCount: userManager.getUserCount(room.roomId)
        }));
        res.json(response);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка при получении списка комнат' });
    }
});

router.post('/', async (req, res) => {
    const { roomId, roomName, creatorName, password } = req.body;
    try {
        const existing = await Room.findOne({ roomId });
        if (existing) return res.status(400).json({ error: 'Комната с таким ID уже существует' });

        const newRoom = await Room.create({
            roomId,
            roomName: roomName || "Новая комната",
            creatorName,
            password: password || null,
            hasPassword: !!password,
            nodes: [], edges: [], messages: []
        });

        const response = { ...newRoom._doc };
        delete response.password;
        res.json(response);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка создания комнаты' });
    }
});

router.post('/verify', async (req, res) => {
    const { roomId, password } = req.body;
    try {
        const room = await Room.findOne({ roomId });
        if (!room) return res.status(404).json({ success: false, error: 'Комната не найдена' });

        if (!room.hasPassword) return res.json({ success: true });

        if (room.password === password) {
            res.json({ success: true });
        } else {
            res.status(401).json({ success: false, error: 'Неверный пароль' });
        }
    } catch (err) {
        res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
});

module.exports = router;