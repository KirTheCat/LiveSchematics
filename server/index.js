const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:3000", "http://localhost"],
        methods: ["GET", "POST"]
    }
});

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/diagram-app';
mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const roomSchema = new mongoose.Schema({
    roomId: String,
    roomName: String,
    creatorName: String,
    nodes: Array,
    edges: Array,
    messages: [
        { system: Boolean, text: String, username: String, time: String, _id: false }
    ]
});

const Room = mongoose.model('Room', roomSchema);
const roomUsers = {};

app.get('/api/rooms', async (req, res) => {
    try {
        const activeRoomIds = Object.keys(roomUsers).filter(id => roomUsers[id].length > 0);
        if (activeRoomIds.length === 0) return res.json([]);

        const rooms = await Room.find({ roomId: { $in: activeRoomIds } }, 'roomId roomName creatorName');
        const response = rooms.map(room => ({
            ...room._doc,
            userCount: roomUsers[room.roomId]?.length || 0
        }));
        res.json(response);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка при получении списка комнат' });
    }
});

app.post('/api/rooms', async (req, res) => {
    const { roomId, roomName, creatorName } = req.body;
    try {
        const existing = await Room.findOne({ roomId });
        if (existing) return res.status(400).json({ error: 'Комната с таким ID уже существует' });
        const newRoom = await Room.create({ roomId, roomName: roomName || "Новая комната", creatorName, nodes: [], edges: [], messages: [] });
        res.json(newRoom);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка создания комнаты' });
    }
});

io.on('connection', (socket) => {
    console.log(`User Connected: ${socket.id}`);

    socket.on('join-room', async ({ roomId, username, roomName }) => {
        let room = await Room.findOne({ roomId });
        if (!room) {
            socket.emit('join-error', { message: 'Комната не найдена или была удалена.' });
            return;
        }

        socket.join(roomId);
        if (!roomUsers[roomId]) roomUsers[roomId] = [];

        const existingUserIndex = roomUsers[roomId].findIndex(u => u.socketId === socket.id);
        if (existingUserIndex !== -1) {
            roomUsers[roomId][existingUserIndex].username = username;
            return;
        }

        roomUsers[roomId].push({ socketId: socket.id, username });
        socket.currentRoom = roomId;
        socket.currentUsername = username;

        if (roomName && room.roomName !== roomName) {
            await Room.updateOne({ roomId }, { roomName });
            room.roomName = roomName;
        }

        socket.emit('load-state', {
            nodes: room.nodes, edges: room.edges, roomName: room.roomName, creatorName: room.creatorName, roomId: room.roomId
        });
        socket.emit('chat-history', room.messages || []);

        const userCount = roomUsers[roomId].length;
        await saveAndEmitMessage(roomId, { system: true, text: `Пользователь ${username} подключился. Всего: ${userCount}` });

        io.to(roomId).emit('room-status', { userCount });
        io.to(roomId).emit('users-update', roomUsers[roomId].map(u => u.username));
        socket.to(roomId).emit('user-joined', username);
    });

    socket.on('leave-room', () => {
        handleUserLeave(socket);
    });

    socket.on('check-last-user', (roomId, callback) => {
        const count = roomUsers[roomId]?.length || 0;
        callback(count === 1);
    });

    async function saveAndEmitMessage(roomId, messageData) {
        if (!messageData.time && !messageData.system) {
            messageData.time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        await Room.updateOne({ roomId }, { $push: { messages: messageData } });
        io.to(roomId).emit('chat-message', messageData);
    }

    async function handleUserLeave(socket) {
        const { currentRoom, currentUsername } = socket;

        if (currentRoom && roomUsers[currentRoom]) {

            roomUsers[currentRoom] = roomUsers[currentRoom].filter(u => u.socketId !== socket.id);
            const userCount = roomUsers[currentRoom].length;

            if (currentUsername) {
                await saveAndEmitMessage(currentRoom, {
                    system: true,
                    text: `Пользователь ${currentUsername} покинул комнату. Всего: ${userCount}`
                });
            }

            io.to(currentRoom).emit('room-status', { userCount });
            io.to(currentRoom).emit('users-update', roomUsers[currentRoom].map(u => u.username));

            if (userCount === 0) {
                delete roomUsers[currentRoom];
                await Room.deleteOne({ roomId: currentRoom });
                console.log(`Room ${currentRoom} deleted (empty)`);
            }

            socket.leave(currentRoom);
            socket.currentRoom = null;
            socket.currentUsername = null;
        }
    }

    socket.on('disconnect', () => {
        handleUserLeave(socket);
        console.log('User Disconnected', socket.id);
    });

    socket.on('send-chat-message', async ({ roomId, message, username }) => {
        await saveAndEmitMessage(roomId, { system: false, text: message, username });
    });

    socket.on('nodes-change', async ({ roomId, nodes }) => {
        await Room.findOneAndUpdate({ roomId }, { nodes });
        socket.to(roomId).emit('nodes-update', nodes);
    });

    socket.on('edges-change', async ({ roomId, edges }) => {
        await Room.findOneAndUpdate({ roomId }, { edges });
        socket.to(roomId).emit('edges-update', edges);
    });
});

server.listen(3001, () => console.log('Server running on port 3001'));