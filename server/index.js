// server/index.js
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
});

const Room = mongoose.model('Room', roomSchema);

io.on('connection', (socket) => {
    console.log(`User Connected: ${socket.id}`);

    socket.on('join-room', async ({ roomId, username, roomName }) => {
        socket.join(roomId);

        let room = await Room.findOne({ roomId });

        if (!room) {

            const name = roomName || "Новая комната";
            room = await Room.create({
                roomId,
                roomName: name,
                creatorName: username,
                nodes: [],
                edges: []
            });
            console.log(`Room ${roomId} created by ${username}`);
        }

        socket.emit('load-state', {
            nodes: room.nodes,
            edges: room.edges,
            roomName: room.roomName,
            creatorName: room.creatorName,
            roomId: room.roomId
        });

        socket.to(roomId).emit('user-joined', username);
    });

    socket.on('nodes-change', async ({ roomId, nodes }) => {
        await Room.findOneAndUpdate({ roomId }, { nodes });
        socket.to(roomId).emit('nodes-update', nodes);
    });

    socket.on('edges-change', async ({ roomId, edges }) => {
        await Room.findOneAndUpdate({ roomId }, { edges });
        socket.to(roomId).emit('edges-update', edges);
    });

    socket.on('disconnect', () => {
        console.log('User Disconnected', socket.id);
    });
});

server.listen(3001, () => {
    console.log('Server running on port 3001');
});