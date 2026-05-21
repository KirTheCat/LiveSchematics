//src/hooks/useDiagram/index.js
import { useState, useCallback, useRef, useEffect } from 'react';
import { applyNodeChanges, applyEdgeChanges, addEdge } from 'reactflow';
import { useSync } from './useSync';
import { createNode } from './utils';
import { useDrag } from '../useDrag';

const HISTORY_STORAGE_KEY = 'diagram_history_';

export const useDiagram = (roomId, user) => {
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);
    const [roomInfo, setRoomInfo] = useState(null);
    const idCounter = useRef(1);

    const nodesRef = useRef([]);
    const edgesRef = useRef([]);
    const [history, setHistory] = useState([]);
    const historyRef = useRef([]);
    const historyIndexRef = useRef(-1);
    const skipNextHistory = useRef(false);

    useEffect(() => { nodesRef.current = nodes; }, [nodes]);
    useEffect(() => { edgesRef.current = edges; }, [edges]);
    useEffect(() => { historyRef.current = history; }, [history]);
    useEffect(() => {
        if (!roomId) return;
        try {
            const saved = sessionStorage.getItem(HISTORY_STORAGE_KEY + roomId);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed.history && parsed.history.length > 0) {
                    setHistory(parsed.history);
                    historyIndexRef.current = parsed.index;
                }
            }
        } catch (e) { console.error("History read error", e); }
    }, [roomId]);

    useEffect(() => {
        if (history.length === 0 || !roomId) return;
        try {
            sessionStorage.setItem(HISTORY_STORAGE_KEY + roomId, JSON.stringify({ history, index: historyIndexRef.current }));
        } catch (e) { console.error("History save error", e); }
    }, [history, roomId]);

    const handleStateLoad = useCallback((state, isPartial = false) => {
        if (isPartial) {
            if (state.nodes) setNodes(state.nodes);
            if (state.edges) setEdges(state.edges);
            return;
        }
        setNodes(state.nodes || []);
        setEdges(state.edges || []);
        setRoomInfo({
            roomName: state.roomName,
            creatorName: state.creatorName,
            roomId: state.roomId,
        });
        if (state.nodes?.length > 0) {
            const lastId = Math.max(...state.nodes.map((n) => parseInt(n.id.replace('node-', ''), 10)));
            idCounter.current = (isNaN(lastId) ? 0 : lastId) + 1;
        }
        if (historyRef.current.length === 0) {
            setHistory([{ nodes: state.nodes || [], edges: state.edges || [] }]);
            historyIndexRef.current = 0;
        }
    }, []);

    const { emitNodes, emitEdges } = useSync(roomId, user, handleStateLoad);

    const pushToHistory = useCallback((newNodes, newEdges, actionName = "Action") => {
        if (skipNextHistory.current) {
            skipNextHistory.current = false;
            return;
        }
        const nodesSnapshot = newNodes ? JSON.parse(JSON.stringify(newNodes)) : JSON.parse(JSON.stringify(nodesRef.current));
        const edgesSnapshot = newEdges ? JSON.parse(JSON.stringify(newEdges)) : JSON.parse(JSON.stringify(edgesRef.current));
        const newHistoryEntry = { nodes: nodesSnapshot, edges: edgesSnapshot };
        const newHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
        newHistory.push(newHistoryEntry);
        setHistory(newHistory);
        historyIndexRef.current = newHistory.length - 1;
    }, []);

    const undo = useCallback(() => {
        if (historyIndexRef.current <= 0) return;
        skipNextHistory.current = true;
        const prevIndex = historyIndexRef.current - 1;
        const prevState = historyRef.current[prevIndex];
        historyIndexRef.current = prevIndex;
        setNodes(prevState.nodes);
        setEdges(prevState.edges);
        emitNodes(prevState.nodes);
        emitEdges(prevState.edges);
    }, [emitNodes, emitEdges]);

    const redo = useCallback(() => {
        if (historyIndexRef.current >= historyRef.current.length - 1) return;
        skipNextHistory.current = true;
        const nextIndex = historyIndexRef.current + 1;
        const nextState = historyRef.current[nextIndex];
        historyIndexRef.current = nextIndex;
        setNodes(nextState.nodes);
        setEdges(nextState.edges);
        emitNodes(nextState.nodes);
        emitEdges(nextState.edges);
    }, [emitNodes, emitEdges]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            const isUndo = (e.metaKey || e.ctrlKey) && e.code === 'KeyZ' && !e.shiftKey;
            const isRedo = (e.metaKey || e.ctrlKey) && (e.code === 'KeyY' || (e.code === 'KeyZ' && e.shiftKey));
            if (isUndo) { e.preventDefault(); undo(); }
            else if (isRedo) { e.preventDefault(); redo(); }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [undo, redo]);

    const onNodesChange = useCallback((changes) => {
        const hasRemoval = changes.some(c => c.type === 'remove');

        if (hasRemoval) {
            setNodes((nds) => {
                let newNodes = applyNodeChanges(changes, nds);
                const removedIds = changes.filter(c => c.type === 'remove').map(c => c.id);
                newNodes = newNodes.filter(n => !removedIds.includes(n.parentId));

                emitNodes(newNodes);
                pushToHistory(newNodes, edgesRef.current, "Remove Node");
                return newNodes;
            });
        } else {
            setNodes((nds) => {
                const newNodes = applyNodeChanges(changes, nds);
                changes.forEach(change => {
                    if (change.type === 'dimensions' && change.dimensions) {
                        const parent = newNodes.find(n => n.id === change.id);
                        if (parent?.type === 'class') {
                            newNodes.forEach((n, i) => {
                                if (n.parentId === change.id) {
                                    newNodes[i] = { ...n, style: { ...n.style, width: change.dimensions.width - 8 } };
                                }
                            });
                        }
                    }
                });
                emitNodes(newNodes);
                return newNodes;
            });
        }
    }, [emitNodes, pushToHistory]);

    const deleteNode = useCallback((id) => {
        setNodes((nds) => {
            const idsToDelete = [id];
            nds.forEach(n => {
                if (n.parentId === id) idsToDelete.push(n.id);
            });

            const newNodes = nds.filter(n => !idsToDelete.includes(n.id));
            emitNodes(newNodes);
            pushToHistory(newNodes, edgesRef.current, "Delete Node");
            return newNodes;
        });
    }, [emitNodes, pushToHistory]);

    const { onNodeDragStart, onNodeDrag, onNodeDragStop } = useDrag(
        nodesRef, setNodes, pushToHistory, edgesRef, reactFlowInstance
    );

    const onEdgesChange = useCallback((changes) => {
        const hasRemoval = changes.some(c => c.type === 'remove');
        if (hasRemoval) {
            const newEdges = applyEdgeChanges(changes, edgesRef.current);
            setEdges(newEdges);
            emitEdges(newEdges);
            pushToHistory(nodesRef.current, newEdges, "Remove Edge");
        } else {
            setEdges(eds => {
                const newEdges = applyEdgeChanges(changes, eds);
                emitEdges(newEdges);
                return newEdges;
            });
        }
    }, [emitEdges, pushToHistory]);

    const onConnect = useCallback((params) => {
        const newEdges = addEdge(params, edgesRef.current);
        setEdges(newEdges);
        emitEdges(newEdges);
        pushToHistory(nodesRef.current, newEdges, "Connect");
    }, [emitEdges, pushToHistory]);

    const duplicateNode = useCallback((id) => {
        setNodes(nds => {
            const nodeToCopy = nds.find(n => n.id === id);
            if (!nodeToCopy) return nds;

            const newParentId = `node-${idCounter.current}`;
            const newParentNode = {
                ...nodeToCopy,
                id: newParentId,
                position: { x: nodeToCopy.position.x + 50, y: nodeToCopy.position.y + 50 },
                data: { ...nodeToCopy.data, label: `${nodeToCopy.data.label} (copy)` },
                selected: false
            };

            const children = nds.filter(n => n.parentId === id);
            const newChildren = children.map((child, i) => ({
                ...child,
                id: `node-${idCounter.current + i + 1}`,
                parentId: newParentId,
                position: child.position,
                data: { ...child.data, parentId: newParentId },
                selected: false
            }));

            idCounter.current += 1 + newChildren.length;

            const updatedNodes = [...nds, newParentNode, ...newChildren];
            pushToHistory(updatedNodes, edgesRef.current, "Duplicate Node");
            emitNodes(updatedNodes);
            return updatedNodes;
        });
    }, [emitNodes, pushToHistory]);

    const onDrop = useCallback((e) => {
        e.preventDefault();
        const type = e.dataTransfer.getData('application/reactflow');
        if (!type || !reactFlowInstance) return;

        const position = reactFlowInstance.screenToFlowPosition({ x: e.clientX, y: e.clientY });
        const newNode = createNode(type, position, idCounter.current, deleteNode);

        setNodes(nds => {
            const updated = [...nds, newNode];
            emitNodes(updated);
            pushToHistory(updated, edgesRef.current, `Add Node ${type}`);
            return updated;
        });
        idCounter.current += 1;
    }, [reactFlowInstance, deleteNode, emitNodes, pushToHistory]);

    const handleNodeChange = useCallback((id, updates) => {
        setNodes(nds => {
            const newNodes = nds.map(node => {
                if (node.id !== id) return node;
                const isSimple = ['default', 'class'].includes(node.type);
                const newStyle = { ...node.style, ...updates.style };
                const newData = { ...node.data, ...updates.data };

                if (updates.data?.nodeStyle) {
                    newData.nodeStyle = { ...node.data.nodeStyle, ...updates.data.nodeStyle };
                    if (isSimple) {
                        if (updates.data.nodeStyle.background) newStyle.background = updates.data.nodeStyle.background;
                        if (updates.data.nodeStyle.borderColor) newStyle.borderColor = updates.data.nodeStyle.borderColor;
                    }
                }
                if (updates.data?.textStyle) newData.textStyle = { ...node.data.textStyle, ...updates.data.textStyle };

                return { ...node, style: newStyle, data: newData };
            });
            emitNodes(newNodes);
            pushToHistory(newNodes, edgesRef.current, "Property Change");
            return newNodes;
        });
    }, [emitNodes, pushToHistory]);

    const handleEdgeChange = useCallback((id, updates) => {
        setEdges(eds => {
            const newEdges = eds.map(edge => {
                if (edge.id !== id) return edge;
                return {
                    ...edge,
                    type: updates.type || edge.type,
                    style: updates.style || edge.style,
                    markerStart: updates.markerStart !== undefined ? updates.markerStart : edge.markerStart,
                    markerEnd: updates.markerEnd !== undefined ? updates.markerEnd : edge.markerEnd,
                };
            });
            emitEdges(newEdges);
            pushToHistory(nodesRef.current, newEdges, "Edge Style Change");
            return newEdges;
        });
    }, [emitEdges, pushToHistory]);

    const saveDiagram = useCallback(() => {
        if (!nodes.length) return alert("Схема пуста");
        const data = JSON.stringify({ nodes, edges }, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `diagram-${roomId}-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(a.href);
    }, [nodes, edges, roomId]);

    const loadDiagram = useCallback((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = JSON.parse(e.target.result);
                if (content.nodes && content.edges) {
                    setNodes(content.nodes);
                    setEdges(content.edges);
                    emitNodes(content.nodes);
                    emitEdges(content.edges);
                    pushToHistory(content.nodes, content.edges, "Load File");
                }
            } catch { alert("Ошибка чтения"); }
        };
        reader.readAsText(file);
    }, [emitNodes, emitEdges, pushToHistory]);


    return {
        nodes, edges, reactFlowInstance, roomInfo,
        onNodesChange, onEdgesChange, onConnect,
        onDrop, onDragOver: (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; },
        onInit: setReactFlowInstance,
        onNodeDrag, onNodeDragStop, onNodeDragStart,
        deleteNode, duplicateNode,
        isValidConnection: (c) => c.source !== c.target,
        handleNodeChange, handleEdgeChange,
        selectedNode: nodes.find(n => n.selected),
        selectedEdge: edges.find(e => e.selected),
        saveDiagram, loadDiagram,
        undo, redo,
    };
};