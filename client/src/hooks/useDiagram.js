// src/hooks/useDiagram.js
import { useState, useCallback, useRef, useEffect } from 'react';
import { applyNodeChanges, applyEdgeChanges, addEdge } from 'reactflow';
import io from 'socket.io-client';

const socket = io.connect(window.location.origin);

export const useDiagram = (roomId, user) => {
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);
    const idCounter = useRef(1);
    const [roomInfo, setRoomInfo] = useState(null);

    const HEADER_HEIGHT = 60;
    const TEXT_BLOCK_HEIGHT = 25;
    const PADDING = 4;

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
            roomName: user.roomName,
        });

        socket.on('load-state', (state) => {
            setNodes(state.nodes || []);
            setEdges(state.edges || []);

            setRoomInfo({
                roomName: state.roomName,
                creatorName: state.creatorName,
                roomId: state.roomId,
            });

            if (state.nodes?.length > 0) {
                const lastId = Math.max(
                    ...state.nodes.map((n) => parseInt(n.id.replace('node-', '')))
                );
                idCounter.current = lastId + 1;
            }
        });

        socket.on('nodes-update', setNodes);
        socket.on('edges-update', setEdges);

        return () => {
            socket.off('load-state');
            socket.off('nodes-update');
            socket.off('edges-update');
        };
    }, [roomId, user]);

    // --- ОБРАБОТЧИКИ ---
    const onNodesChange = useCallback((changes) => {
        const newNodes = applyNodeChanges(changes, nodes);

        changes.forEach(change => {
            if (change.type === 'dimensions' && change.dimensions) {
                const changedNode = newNodes.find(n => n.id === change.id);
                if (changedNode && changedNode.type === 'class') {
                    newNodes.forEach((n, index) => {
                        if (n.parentId === change.id) {
                            newNodes[index] = {
                                ...n,
                                style: { ...n.style, width: change.dimensions.width - PADDING * 2 }
                            };
                        }
                    });
                }
            }
        });

        setNodes(newNodes);
        socket.emit('nodes-change', { roomId, nodes: newNodes });
    }, [nodes, roomId]);

    const onEdgesChange = useCallback(
        (changes) => {
            const newEdges = applyEdgeChanges(changes, edges);
            setEdges(newEdges);
            syncEdges(newEdges);
        },
        [edges, roomId]
    );

    const onConnect = useCallback(
        (params) => {
            const newEdges = addEdge(params, edges);
            setEdges(newEdges);
            syncEdges(newEdges);
        },
        [edges, roomId]
    );

    const deleteNode = useCallback(
        (id) => {
            setNodes((nds) => {
                const newNodes = nds.filter((node) => node.id !== id);
                syncNodes(newNodes);
                return newNodes;
            });
        },
        [roomId]
    );

    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event) => {
            event.preventDefault();

            const type = event.dataTransfer.getData('application/reactflow');
            if (!type || !reactFlowInstance) return;

            const position = reactFlowInstance.screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const currentId = idCounter.current;

            // --- СОЗДАНИЕ УЗЛА ---
            let label = `Блок ${currentId}`;
            let style = { width: 150, height: 80, background: 'transparent' };
            let nodeStyle = { background: '#fff', borderColor: '#555' };
            let data = {
                isNew: false,
                onDelete: undefined,
                textStyle: { color: '#000', fontSize: '14px' },
                nodeStyle,
            };

            switch (type) {
                case 'default':
                    style = { width: 150, height: 80, background: '#fff' };
                    break;

                case 'class':
                    style = { width: 200, height: 250, background: '#fff' };
                    data.splitY = HEADER_HEIGHT + (240 - HEADER_HEIGHT) / 2;
                    break;

                case 'circle':
                    style = { width: 100, height: 100, background: 'transparent' };
                    break;

                case 'textblock':
                    label = `Текст ${currentId}`;
                    style = { width: 150, height: 40, background: 'transparent' };
                    data.isNew = true;
                    data.onDelete = deleteNode;
                    break;

                case 'actor':
                    label = `Актер ${currentId}`;
                    style = { width: 80, height: 120, background: 'transparent' };
                    break;

                case 'database':
                    label = `БД ${currentId}`;
                    style = { width: 100, height: 100, background: 'transparent' };
                    break;

                case 'diamond':
                    label = 'Условие';
                    style = { width: 120, height: 120, background: 'transparent' };
                    break;

                case 'group':
                    label = `Группа ${currentId}`;
                    style = {
                        width: 400,
                        height: 300,
                        background: 'rgba(240, 240, 240, 0.5)',
                        zIndex: -10,
                    };
                    data.nodeStyle = {
                        background: 'rgba(240, 240, 240, 0.5)',
                        borderColor: '#aaa',
                    };
                    break;

                default:
                    break;
            }

            data.label = label;

            const newNode = {
                id: `node-${currentId}`,
                type,
                position,
                style,
                data,
            };

            setNodes((nds) => {
                const updated = [...nds, newNode];
                syncNodes(updated);
                return updated;
            });

            idCounter.current += 1;
        },
        [reactFlowInstance, deleteNode, roomId]
    );

    // --- ИЗМЕНЕНИЕ СВОЙСТВ (Инспектор) ---
    const handleNodeChange = useCallback(
        (id, updates) => {
            setNodes((nds) => {
                const newNodes = nds.map((node) => {
                    if (node.id !== id) return node;

                    const current = node;

                    const newTextStyle = updates.data?.textStyle
                        ? { ...current.data.textStyle, ...updates.data.textStyle }
                        : current.data.textStyle;

                    const newNodeStyle = updates.data?.nodeStyle
                        ? { ...current.data.nodeStyle, ...updates.data.nodeStyle }
                        : current.data.nodeStyle;

                    const isSimpleShape = ['default', 'class'].includes(node.type);

                    let newStyle = { ...current.style, ...updates.style };

                    if (updates.data?.nodeStyle?.background && isSimpleShape) {
                        newStyle.background = updates.data.nodeStyle.background;
                    }

                    if (updates.data?.nodeStyle?.borderColor && isSimpleShape) {
                        newStyle.borderColor = updates.data.nodeStyle.borderColor;
                    }

                    return {
                        ...current,
                        style: newStyle,
                        data: {
                            ...current.data,
                            ...updates.data,
                            textStyle: newTextStyle,
                            nodeStyle: newNodeStyle,
                        },
                    };
                });

                syncNodes(newNodes);
                return newNodes;
            });
        },
        [roomId]
    );

    const handleEdgeChange = useCallback(
        (id, updates) => {
            setEdges((eds) => {
                const newEdges = eds.map((edge) => {
                    if (edge.id !== id) return edge;

                    return {
                        ...edge,
                        type: updates.type || edge.type,
                        style: updates.style || edge.style,
                        markerStart:
                            updates.markerStart !== undefined
                                ? updates.markerStart
                                : edge.markerStart,
                        markerEnd:
                            updates.markerEnd !== undefined
                                ? updates.markerEnd
                                : edge.markerEnd,
                    };
                });

                syncEdges(newEdges);
                return newEdges;
            });
        },
        [roomId]
    );

    const onNodeDrag = useCallback((event, node) => {
        if (node.type !== 'textblock') return;

        const target = nodes.find(n => {
            if (n.type !== 'class') return false;

            const nodeCenterX = node.position.x + (node.width || 150) / 2;
            const nodeCenterY = node.position.y + (node.height || 40) / 2;

            const tX = n.position.x;
            const tY = n.position.y;
            const tW = n.style?.width || 200;
            const tH = n.style?.height || 200;

            return (
                nodeCenterX > tX && nodeCenterX < tX + tW &&
                nodeCenterY > tY && nodeCenterY < tY + tH
            );
        });

        setNodes(nds => nds.map(n => {
            if (n.type === 'class') {
                let newZone = null;

                if (n.id === target?.id) {
                    const nodeCenterY = node.position.y + (node.height || 40) / 2;
                    const relY = nodeCenterY - n.position.y;
                    const currentSplitY = n.data.splitY || (HEADER_HEIGHT + ((n.style?.height || 200) - HEADER_HEIGHT) / 2);

                    if (relY > HEADER_HEIGHT) {
                        newZone = relY < currentSplitY ? 'attributes' : 'methods';
                    }
                }

                if (n.data.activeDropZone !== newZone) {
                    return { ...n, data: { ...n.data, activeDropZone: newZone } };
                }
            }
            return n;
        }));

    }, [nodes]);

    const onNodeDragStop = useCallback((event, node) => {
        setNodes(nds => nds.map(n => {
            if (n.type === 'class' && n.data.activeDropZone) {
                return { ...n, data: { ...n.data, activeDropZone: null } };
            }
            return n;
        }));

        if (node.type !== 'textblock') return;

        const targetClass = nodes.find(n => {
            if (n.type !== 'class') return false;
            const nodeCenterX = node.position.x + (node.width || 150) / 2;
            const nodeCenterY = node.position.y + (node.height || 40) / 2;
            const tH = n.style?.height || 200;
            const tW = n.style?.width || 200;

            return (
                nodeCenterX > n.position.x && nodeCenterX < n.position.x + tW &&
                nodeCenterY > n.position.y && nodeCenterY < n.position.y + tH
            );
        });

        setNodes(nds => {
            let newNodes = [...nds];
            const nodeIndex = newNodes.findIndex(n => n.id === node.id);
            if (nodeIndex === -1) return nds;

            if (targetClass) {
                const targetIndex = newNodes.findIndex(n => n.id === targetClass.id);
                let targetNode = newNodes[targetIndex];
                let oldClassHeight = targetNode.style?.height || 200;

                let splitY = targetNode.data.splitY;
                if (!splitY) {
                    splitY = HEADER_HEIGHT + (oldClassHeight - HEADER_HEIGHT) / 2;
                    targetNode = { ...targetNode, data: { ...targetNode.data, splitY } };
                    newNodes[targetIndex] = targetNode;
                }

                const mouseRelY = (node.position.y + (node.height || 40) / 2) - targetNode.position.y;
                const isMethods = mouseRelY > splitY;

                const siblings = newNodes.filter(n =>
                    n.parentId === targetClass.id && n.id !== node.id
                ).filter(n => {
                    const sibY = n.position.y;
                    if (isMethods) return sibY >= splitY;
                    return sibY < splitY && sibY >= HEADER_HEIGHT;
                });

                let sectionStartY = isMethods ? splitY : HEADER_HEIGHT;
                let nextY = sectionStartY + PADDING;

                if (siblings.length > 0) {
                    siblings.sort((a, b) => a.position.y - b.position.y);
                    const lastSibling = siblings[siblings.length - 1];
                    nextY = lastSibling.position.y + (lastSibling.height || TEXT_BLOCK_HEIGHT) + PADDING;
                }

                const textBottom = nextY + TEXT_BLOCK_HEIGHT;
                let newClassHeight = oldClassHeight;
                let newSplitY = splitY;
                let shiftDelta = 0;

                if (!isMethods) {
                    if (textBottom > splitY - PADDING) {
                        newSplitY = textBottom + PADDING;
                        const oldMethodsHeight = oldClassHeight - splitY;
                        newClassHeight = newSplitY + oldMethodsHeight;
                        shiftDelta = newSplitY - splitY;
                    }
                } else {
                    if (textBottom > oldClassHeight - PADDING) {
                        const overflow = (textBottom - oldClassHeight) + 20;
                        newClassHeight = oldClassHeight + overflow;
                    }
                }

                targetNode = {
                    ...targetNode,
                    style: { ...targetNode.style, height: newClassHeight },
                    data: { ...targetNode.data, splitY: newSplitY }
                };
                newNodes[targetIndex] = targetNode;

                if (shiftDelta > 0) {
                    newNodes = newNodes.map(n => {
                        if (n.parentId === targetClass.id && n.id !== node.id) {
                            if (n.position.y >= splitY) {
                                return {
                                    ...n,
                                    position: { x: n.position.x, y: n.position.y + shiftDelta }
                                };
                            }
                        }
                        return n;
                    });
                }

                const classWidth = targetNode.style?.width || 200;
                newNodes[nodeIndex] = {
                    ...newNodes[nodeIndex],
                    parentId: targetClass.id,
                    extent: 'parent',
                    position: { x: PADDING, y: nextY },
                    style: { ...newNodes[nodeIndex].style, width: classWidth - PADDING * 2, height: TEXT_BLOCK_HEIGHT },
                    data: { ...newNodes[nodeIndex].data, parentId: targetClass.id }
                };

            } else if (node.parentId) {
                const parent = newNodes.find(n => n.id === node.parentId);
                if (parent) {
                    const absX = parent.position.x + node.position.x;
                    const absY = parent.position.y + node.position.y;
                    newNodes[nodeIndex] = {
                        ...newNodes[nodeIndex],
                        parentId: undefined, extent: undefined,
                        position: { x: absX, y: absY },
                        style: { ...newNodes[nodeIndex].style, width: 150, height: 40 },
                        data: { ...newNodes[nodeIndex].data, parentId: null }
                    };
                }
            }

            return newNodes;
        });

    }, [nodes]);

    const isValidConnection = (connection) =>
        connection.source !== connection.target;

    return {
        nodes,
        edges,
        reactFlowInstance,
        roomInfo,
        onNodesChange,
        onEdgesChange,
        onConnect,
        onDrop,
        onDragOver,
        onInit: setReactFlowInstance,
        onNodeDrag,
        onNodeDragStop,
        deleteNode,
        isValidConnection,
        handleNodeChange,
        handleEdgeChange,
        selectedNode: nodes.find((n) => n.selected),
        selectedEdge: edges.find((e) => e.selected),
    };
};
