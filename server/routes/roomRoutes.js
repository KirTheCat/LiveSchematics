const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const userManager = require('../utils/userManager');

router.get('/', async (req, res) => {
    try {
        const activeRoomIds = userManager.getActiveRoomIds();
        if (activeRoomIds.length === 0) return res.json([]);

        const rooms = await Room.find({ roomId: { $in: activeRoomIds } }, 'roomId roomName creatorName');

        const response = rooms.map(room => ({
            ...room._doc,
            userCount: userManager.getUserCount(room.roomId)
        }));
        res.json(response);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка при получении списка комнат' });
    }
});

router.post('/', async (req, res) => {
    const { roomId, roomName, creatorName } = req.body;
    try {
        const existing = await Room.findOne({ roomId });
        if (existing) return res.status(400).json({ error: 'Комната с таким ID уже существует' });

        const newRoom = await Room.create({
            roomId,
            roomName: roomName || "Новая комната",
            creatorName,
            nodes: [],
            edges: [],
            messages: []
        });
        res.json(newRoom);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка создания комнаты' });
    }
});

module.exports = router;