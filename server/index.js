const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors({ origin: '*' }));

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
        {
            system: Boolean,
            text: String,
            username: String,
            time: String,
            _id: false
        }
    ]
});

const Room = mongoose.model('Room', roomSchema);

const roomUsers = {};

io.on('connection', (socket) => {
    console.log(`User Connected: ${socket.id}`);

    socket.on('join-room', async ({ roomId, username, roomName }) => {
        socket.join(roomId);

        if (!roomUsers[roomId]) {
            roomUsers[roomId] = [];
        }

        const existingUserIndex = roomUsers[roomId].findIndex(u => u.socketId === socket.id);

        if (existingUserIndex !== -1) {
            roomUsers[roomId][existingUserIndex].username = username;
            return;
        }

        roomUsers[roomId].push({ socketId: socket.id, username });
        socket.currentRoom = roomId;
        socket.currentUsername = username;

        let room = await Room.findOne({ roomId });
        let isNewRoom = false;

        if (!room) {
            isNewRoom = true;
            const name = roomName || "Новая комната";
            room = await Room.create({
                roomId,
                roomName: name,
                creatorName: username,
                nodes: [],
                edges: [],
                messages: []
            });
        }
        socket.emit('load-state', {
            nodes: room.nodes,
            edges: room.edges,
            roomName: room.roomName,
            creatorName: room.creatorName,
            roomId: room.roomId
        });

        socket.emit('chat-history', room.messages || []);

        const userCount = roomUsers[roomId].length;

        if (isNewRoom) {
            await saveAndEmitMessage(roomId, {
                system: true,
                text: `Комната "${room.roomName}" создана`
            });
        }

        await saveAndEmitMessage(roomId, {
            system: true,
            text: `Пользователь ${username} подключился. Всего пользователей: ${userCount}`
        });

        io.to(roomId).emit('users-update', roomUsers[roomId].map(u => u.username));
        socket.to(roomId).emit('user-joined', username);
    });

    async function saveAndEmitMessage(roomId, messageData) {
        if (!messageData.time && !messageData.system) {
            messageData.time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }

        await Room.updateOne(
            { roomId },
            { $push: { messages: messageData } }
            // Ограничение истории: , { $slice: -100 }
        );

        io.to(roomId).emit('chat-message', messageData);
    }

    socket.on('send-chat-message', async ({ roomId, message, username }) => {
        const messageData = {
            system: false,
            text: message,
            username: username,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        await saveAndEmitMessage(roomId, messageData);
    });

    socket.on('nodes-change', async ({ roomId, nodes }) => {
        await Room.findOneAndUpdate({ roomId }, { nodes });
        socket.to(roomId).emit('nodes-update', nodes);
    });

    socket.on('edges-change', async ({ roomId, edges }) => {
        await Room.findOneAndUpdate({ roomId }, { edges });
        socket.to(roomId).emit('edges-update', edges);
    });

    socket.on('disconnect', async () => {
        const { currentRoom, currentUsername } = socket;

        if (currentRoom && roomUsers[currentRoom]) {
            roomUsers[currentRoom] = roomUsers[currentRoom].filter(u => u.socketId !== socket.id);

            const userCount = roomUsers[currentRoom].length;

            if (currentUsername) {
                await saveAndEmitMessage(currentRoom, {
                    system: true,
                    text: `Пользователь ${currentUsername} покинул комнату. Всего пользователей: ${userCount}`
                });
            }

            io.to(currentRoom).emit('users-update', roomUsers[currentRoom].map(u => u.username));

            if (userCount === 0) {
                delete roomUsers[currentRoom];
            }
        }
        console.log('User Disconnected', socket.id);
    });
});

server.listen(3001, () => {
    console.log('Server running on port 3001');
});