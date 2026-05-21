// src/hooks/useDiagram/useSync.js
import { useEffect } from 'react';
import io from 'socket.io-client';

export const socket = io.connect(process.env.REACT_APP_SERVER_URL || window.location.origin);

export const useSync = (roomId, user, onStateLoad) => {

    useEffect(() => {
        if (!roomId || !user) return;

        socket.emit('join-room', {
            roomId,
            username: user.username,
            roomName: user.roomName,
        });

        socket.on('load-state', (state) => {
            onStateLoad(state);
        });

        socket.on('nodes-update', (nodes) => onStateLoad({ nodes }, true));
        socket.on('edges-update', (edges) => onStateLoad({ edges }, true));

        return () => {
            socket.off('load-state');
            socket.off('nodes-update');
            socket.off('edges-update');
        };
    }, [roomId, user, onStateLoad]);

    const emitNodes = (nodes) => socket.emit('nodes-change', { roomId, nodes });
    const emitEdges = (edges) => socket.emit('edges-change', { roomId, edges });

    return { emitNodes, emitEdges };
};