const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const connectDB = require('./src/config/db');
const roomRoutes = require('./src/routes/roomRoutes');
const socketHandler = require('./src/sockets/handlers');

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

connectDB();

app.use('/api/rooms', roomRoutes);

io.on('connection', (socket) => {
    socketHandler(io, socket);
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));