const roomUsers = {};

module.exports = {
    addUser: (roomId, socketId, username) => {
        if (!roomUsers[roomId]) roomUsers[roomId] = [];

        const existingIndex = roomUsers[roomId].findIndex(u => u.socketId === socketId);
        if (existingIndex !== -1) {
            roomUsers[roomId][existingIndex].username = username;
            return false;
        }

        roomUsers[roomId].push({ socketId, username });
        return true;
    },

    removeUser: (socketId) => {
        for (const roomId in roomUsers) {
            const index = roomUsers[roomId].findIndex(u => u.socketId === socketId);
            if (index !== -1) {
                const [removedUser] = roomUsers[roomId].splice(index, 1);
                return {
                    roomId,
                    username: removedUser.username,
                    userCount: roomUsers[roomId].length
                };
            }
        }
        return null;
    },

    getUsers: (roomId) => roomUsers[roomId] || [],
    getUserCount: (roomId) => (roomUsers[roomId] || []).length,
    getActiveRoomIds: () => Object.keys(roomUsers).filter(id => roomUsers[id].length > 0)
};