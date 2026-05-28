import { useEffect } from 'react';
import io from 'socket.io-client';

export const socket = io.connect(process.env.REACT_APP_SERVER_URL || window.location.origin);

export const useSync = (roomId, user, onStateLoad, onJoinError) => {

    useEffect(() => {
        // ИСПРАВЛЕНИЕ: Не делаем ничего, если нет user (например, при редиректе)
        if (!roomId || !user) return;

        socket.emit('join-room', {
            roomId,
            username: user.username,
            roomName: user.roomName,
        });

        socket.on('load-state', (state) => {
            onStateLoad(state);
        });

        socket.on('join-error', (error) => {
            if (onJoinError) onJoinError(error);
        });

        socket.on('nodes-update', (nodes) => onStateLoad({ nodes }, true));
        socket.on('edges-update', (edges) => onStateLoad({ edges }, true));

        return () => {
            socket.off('load-state');
            socket.off('join-error');
            socket.off('nodes-update');
            socket.off('edges-update');
        };
    }, [roomId, user, onStateLoad, onJoinError]);

    const emitNodes = (nodes) => socket.emit('nodes-change', { roomId, nodes });
    const emitEdges = (edges) => socket.emit('edges-change', { roomId, edges });

    return { emitNodes, emitEdges };
};