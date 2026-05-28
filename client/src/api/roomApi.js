// src/api/roomApi.js
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

export const roomApi = {
    getRooms: async () => {
        const res = await axios.get(`${API_URL}/rooms`);
        return res.data;
    },

    createRoom: async (roomId, roomName, creatorName, password) => {
        await axios.post(`${API_URL}/rooms`, {
            roomId,
            roomName,
            creatorName,
            password: password || null
        });
    },

    verifyRoom: async (roomId, password) => {
        return await axios.post(`${API_URL}/rooms/verify`, { roomId, password });
    }
};