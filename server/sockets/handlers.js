const Room = require('../models/Room');
const userManager = require('../utils/userManager');

async function saveAndEmitMessage(io, roomId, messageData) {
    if (!messageData.time && !messageData.system) {
        messageData.time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    await Room.updateOne({ roomId }, { $push: { messages: messageData } });
    io.to(roomId).emit('chat-message', messageData);
}

module.exports = (io, socket) => {
    console.log(`User Connected: ${socket.id}`);

    socket.on('join-room', async ({ roomId, username, roomName }) => {
        let room = await Room.findOne({ roomId });
        if (!room) {
            socket.emit('join-error', { message: 'Комната не найдена или была удалена.' });
            return;
        }

        socket.join(roomId);

        const isNewJoin = userManager.addUser(roomId, socket.id, username);

        socket.currentRoom = roomId;
        socket.currentUsername = username;

        if (!isNewJoin) return;

        if (roomName && room.roomName !== roomName) {
            await Room.updateOne({ roomId }, { roomName });
            room.roomName = roomName;
        }

        socket.emit('load-state', {
            nodes: room.nodes, edges: room.edges, roomName: room.roomName, creatorName: room.creatorName, roomId: room.roomId
        });
        socket.emit('chat-history', room.messages || []);

        const userCount = userManager.getUserCount(roomId);
        await saveAndEmitMessage(io, roomId, { system: true, text: `Пользователь ${username} подключился. Всего: ${userCount}` });

        io.to(roomId).emit('room-status', { userCount });
        io.to(roomId).emit('users-update', userManager.getUsers(roomId).map(u => u.username));
        socket.to(roomId).emit('user-joined', username);

        // --- ОПОВЕЩАЕМ ЛОББИ ---
        io.emit('rooms-updated');
    });

    socket.on('leave-room', async () => {
        await handleUserLeave(socket, io);
    });

    socket.on('check-last-user', (roomId, callback) => {
        const count = userManager.getUserCount(roomId);
        callback(count === 1);
    });

    socket.on('send-chat-message', async ({ roomId, message, username }) => {
        await saveAndEmitMessage(io, roomId, { system: false, text: message, username });
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
        await handleUserLeave(socket, io);
        console.log('User Disconnected', socket.id);
    });
};

async function handleUserLeave(socket, io) {
    const { currentRoom, currentUsername } = socket;

    if (!currentRoom) return;

    const data = userManager.removeUser(socket.id);
    if (!data) return;

    const { roomId, username, userCount } = data;

    if (username) {
        await saveAndEmitMessage(io, roomId, { system: true, text: `Пользователь ${username} покинул комнату. Всего: ${userCount}` });
    }

    io.to(roomId).emit('room-status', { userCount });
    io.to(roomId).emit('users-update', userManager.getUsers(roomId).map(u => u.username));

    if (userCount === 0) {
        await Room.deleteOne({ roomId });
        console.log(`Room ${roomId} deleted (empty)`);
    }

    socket.leave(roomId);
    socket.currentRoom = null;
    socket.currentUsername = null;

    // --- ОПОВЕЩАЕМ ЛОББИ ---
    io.emit('rooms-updated');
}