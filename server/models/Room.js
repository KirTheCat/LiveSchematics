const mongoose = require('mongoose');

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

module.exports = mongoose.model('Room', roomSchema);