// src/hooks/useDiagram.js
import { useState, useCallback, useRef, useEffect } from 'react';
import { applyNodeChanges, applyEdgeChanges, addEdge } from 'reactflow';
import io from 'socket.io-client';

const socket = io.connect('http://localhost:3001');

export const useDiagram = (roomId,user) => {
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);
    const idCounter = useRef(1);
    const [roomInfo, setRoomInfo] = useState(null);

    // --- СИНХРОНИЗАЦИЯ ---
    const syncNodes = (newNodes) => {
        socket.emit('nodes-change', { roomId, nodes: newNodes });
    };

    const syncEdges = (newEdges) => {
        socket.emit('edges-change', { roomId, edges: newEdges });
    };

    useEffect(() => {
        if (!roomId || !user) return;

        socket.emit('join-room', {
            roomId,
            username: user.username,
            roomName: user.roomName
        });

        socket.on('load-state', (state) => {
            setNodes(state.nodes || []);
            setEdges(state.edges || []);
            setRoomInfo({
                roomName: state.roomName,
                creatorName: state.creatorName,
                roomId: state.roomId
            });

            if (state.nodes && state.nodes.length > 0) {
                const lastId = Math.max(...state.nodes.map(n => parseInt(n.id.replace('node-', ''))));
                idCounter.current = lastId + 1;
            }
        });

        socket.on('nodes-update', (newNodes) => setNodes(newNodes));
        socket.on('edges-update', (newEdges) => setEdges(newEdges));

        return () => {
            socket.off('load-state');
            socket.off('nodes-update');
            socket.off('edges-update');
        };
    }, [roomId, user]);

    // --- ОБРАБОТЧИКИ ---
    const onNodesChange = useCallback((changes) => {
        const newNodes = applyNodeChanges(changes, nodes);
        setNodes(newNodes);
        syncNodes(newNodes);
    }, [nodes, roomId]);

    const onEdgesChange = useCallback((changes) => {
        const newEdges = applyEdgeChanges(changes, edges);
        setEdges(newEdges);
        syncEdges(newEdges);
    }, [edges, roomId]);

    const onConnect = useCallback((params) => {
        const newEdges = addEdge(params, edges);
        setEdges(newEdges);
        syncEdges(newEdges);
    }, [edges, roomId]);

    const deleteNode = useCallback((id) => {
        setNodes((nds) => {
            const newNodes = nds.filter((node) => node.id !== id);
            syncNodes(newNodes);
            return newNodes;
        });
    }, [roomId]);

    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback((event) => {
        event.preventDefault();
        const type = event.dataTransfer.getData('application/reactflow');
        if (typeof type === 'undefined' || !type || !reactFlowInstance) return;

        const position = reactFlowInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY });
        const currentId = idCounter.current;

        // Логика создания узла
        let label = `Блок ${currentId}`;
        let style = { width: 150, height: 80, background: 'transparent' };
        let nodeStyle = { background: '#fff', borderColor: '#555' };
        let data = { isNew: false, onDelete: undefined, textStyle: { color: '#000', fontSize: '14px' }, nodeStyle: nodeStyle };

        switch (type) {
            case 'default': case 'class': style.background = '#fff'; break;
            case 'circle': style.width = 100; style.height = 100; break;
            case 'textblock': label = `Текст ${currentId}`; style = { width: 150, height: 40, background: 'transparent' }; data.isNew = true; data.onDelete = deleteNode; break;
            case 'actor': label = `Актер ${currentId}`; style = { width: 80, height: 120, background: 'transparent' }; break;
            case 'database': label = `БД ${currentId}`; style = { width: 100, height: 100, background: 'transparent' }; break;
            case 'diamond': label = `Условие`; style = { width: 120, height: 120, background: 'transparent' }; break;
            case 'group': label = `Группа ${currentId}`; style = { width: 400, height: 300, background: 'rgba(240, 240, 240, 0.5)' }; data.nodeStyle = { background: 'rgba(240, 240, 240, 0.5)', borderColor: '#aaa' }; break;
            default: break;
        }
        data.label = label;

        const newNode = { id: `node-${currentId}`, type, position, style, data };

        setNodes((nds) => {
            const updatedNodes = [...nds, newNode];
            syncNodes(updatedNodes);
            return updatedNodes;
        });

        idCounter.current += 1;
    }, [reactFlowInstance, deleteNode, roomId]);

    // --- ИЗМЕНЕНИЕ СВОЙСТВ (Инспектор) ---
    const handleNodeChange = useCallback((id, updates) => {
        setNodes((nds) => {
            const newNodes = nds.map((node) => {
                if (node.id === id) {
                    const currentNode = node;
                    const newTextStyle = updates.data?.textStyle ? { ...currentNode.data.textStyle, ...updates.data.textStyle } : currentNode.data.textStyle;
                    const newNodeStyle = updates.data?.nodeStyle ? { ...currentNode.data.nodeStyle, ...updates.data.nodeStyle } : currentNode.data.nodeStyle;
                    const isSimpleShape = ['default', 'class'].includes(node.type);
                    let newStyle = { ...currentNode.style, ...updates.style };

                    if (updates.data?.nodeStyle?.background && isSimpleShape) newStyle.background = updates.data.nodeStyle.background;
                    if (updates.data?.nodeStyle?.borderColor && isSimpleShape) newStyle.borderColor = updates.data.nodeStyle.borderColor;

                    return { ...currentNode, style: newStyle, data: { ...currentNode.data, ...updates.data, textStyle: newTextStyle, nodeStyle: newNodeStyle } };
                }
                return node;
            });
            syncNodes(newNodes);
            return newNodes;
        });
    }, [roomId]);

    const handleEdgeChange = useCallback((id, updates) => {
        setEdges((eds) => {
            const newEdges = eds.map((edge) => {
                if (edge.id === id) {
                    return {
                        ...edge,
                        type: updates.type || edge.type,
                        style: updates.style || edge.style,
                        markerStart: updates.markerStart !== undefined ? updates.markerStart : edge.markerStart,
                        markerEnd: updates.markerEnd !== undefined ? updates.markerEnd : edge.markerEnd
                    };
                }
                return edge;
            });
            syncEdges(newEdges);
            return newEdges;
        });
    }, [roomId]);

    const isValidConnection = (connection) => connection.source !== connection.target;

    return {
        nodes, edges, reactFlowInstance, roomInfo,
        onNodesChange, onEdgesChange, onConnect, onDrop, onDragOver,
        onInit: setReactFlowInstance,
        deleteNode, isValidConnection,
        handleNodeChange, handleEdgeChange,
        selectedNode: nodes.find(node => node.selected),
        selectedEdge: edges.find(edge => edge.selected)
    };
};