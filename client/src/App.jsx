// App.jsx
import React, { useState, useCallback, useRef } from 'react';
import ReactFlow, {
    ReactFlowProvider,
    Controls,
    Background,
    applyNodeChanges,
    applyEdgeChanges,
    addEdge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import './App.css';
import Toolbar from './Toolbar';
import Inspector from './Inspector';
import { ConnectionLine } from './ConnectionLine';

import {
    DefaultBlock, CircleBlock, CloudBlock, TextBlock,
    ActorBlock, DatabaseBlock, DiamondBlock, ClassBlock, GroupBlock
} from './CustomNodes';

const nodeTypes = {
    default: DefaultBlock,
    circle: CircleBlock,
    cloud: CloudBlock,
    textblock: TextBlock,
    actor: ActorBlock,
    database: DatabaseBlock,
    diamond: DiamondBlock,
    class: ClassBlock,
    group: GroupBlock,
};

const defaultEdgeOptions = {
    type: 'smoothstep',
    markerEnd: 'arrow',
    style: { strokeWidth: 2, stroke: '#333' }
};

const initialNodes = [];
const initialEdges = [];

function App() {
    const [nodes, setNodes] = useState(initialNodes);
    const [edges, setEdges] = useState(initialEdges);
    const reactFlowWrapper = useRef(null);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);
    const idCounter = useRef(1);
    const [isInspectorOpen, setIsInspectorOpen] = useState(true);
    const [showHandles, setShowHandles] = useState(true);

    const selectedNode = nodes.find(node => node.selected);
    const selectedEdge = edges.find(edge => edge.selected);

    const onNodesChange = useCallback(
        (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
        []
    );

    const onEdgesChange = useCallback(
        (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        []
    );

    const onConnect = useCallback(
        (params) => setEdges((eds) => addEdge(params, eds)),
        []
    );

    const deleteNode = useCallback((id) => {
        setNodes((nds) => nds.filter((node) => node.id !== id));
    }, []);

    const isValidConnection = (connection) => connection.source !== connection.target;

    const handleNodeChange = useCallback((id, updates) => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === id) {
                    const currentNode = node;

                    const newTextStyle = updates.data?.textStyle
                        ? { ...currentNode.data.textStyle, ...updates.data.textStyle }
                        : currentNode.data.textStyle;

                    const newNodeStyle = updates.data?.nodeStyle
                        ? { ...currentNode.data.nodeStyle, ...updates.data.nodeStyle }
                        : currentNode.data.nodeStyle;

                    const isSimpleShape = ['default', 'class'].includes(node.type);

                    let newStyle = { ...currentNode.style, ...updates.style };

                    if (updates.data?.nodeStyle?.background) {
                        if (isSimpleShape) {
                            newStyle.background = updates.data.nodeStyle.background;
                        }
                    }

                    if (updates.data?.nodeStyle?.borderColor) {
                        if (isSimpleShape) {
                            newStyle.borderColor = updates.data.nodeStyle.borderColor;
                        }
                    }

                    return {
                        ...currentNode,
                        style: newStyle,
                        data: {
                            ...currentNode.data,
                            ...updates.data,
                            textStyle: newTextStyle,
                            nodeStyle: newNodeStyle
                        }
                    };
                }
                return node;
            })
        );
    }, []);

    const handleEdgeChange = useCallback((id, updates) => {
        setEdges((eds) =>
            eds.map((edge) => {
                if (edge.id === id) {
                    return {
                        ...edge,
                        type: updates.type || edge.type,
                        style: updates.style || edge.style,
                        // Просто передаем ID маркера (например, 'arrow', 'diamond-filled')
                        // React Flow сам подставит url(#...)
                        markerStart: updates.markerStart !== undefined ? updates.markerStart : edge.markerStart,
                        markerEnd: updates.markerEnd !== undefined ? updates.markerEnd : edge.markerEnd,
                    };
                }
                return edge;
            })
        );
    }, []);

    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event) => {
            event.preventDefault();
            const type = event.dataTransfer.getData('application/reactflow');
            if (typeof type === 'undefined' || !type) return;

            if (reactFlowInstance) {
                const position = reactFlowInstance.screenToFlowPosition({
                    x: event.clientX,
                    y: event.clientY,
                });

                const currentId = idCounter.current;

                let label = `Блок ${currentId}`;
                let style = { width: 150, height: 80, background: 'transparent' };
                let nodeStyle = { background: '#fff', borderColor: '#555' };

                let data = {
                    isNew: false,
                    onDelete: undefined,
                    textStyle: { color: '#000', fontSize: '14px' },
                    nodeStyle: nodeStyle
                };

                switch (type) {
                    case 'default':
                    case 'class':
                        style.background = '#fff';
                        break;
                    case 'circle':
                        style.width = 80;
                        style.height = 80;
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
                        label = `Условие`;
                        style = { width: 120, height: 120, background: 'transparent' };
                        break;
                    case 'group':
                        label = `Группа ${currentId}`;
                        style = { width: 400, height: 300, background: 'rgba(240, 240, 240, 0.5)' };
                        data.nodeStyle = { background: 'rgba(240, 240, 240, 0.5)', borderColor: '#aaa' };
                        break;
                    default:
                        break;
                }

                data.label = label;

                const newNode = {
                    id: `node-${currentId}`,
                    type: type,
                    position: position,
                    style: style,
                    data: data,
                };

                setNodes((nds) => [...nds, newNode]);
                idCounter.current += 1;
            }
        },
        [reactFlowInstance, deleteNode]
    );

    return (
        <div style={{ width: '100vw', height: '100vh', display: 'flex' }}>
            <Toolbar />
            <div style={{ flexGrow: 1 }} ref={reactFlowWrapper}>
                <ReactFlowProvider>
                    <ReactFlow
                        className={showHandles ? '' : 'hide-handles'}
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onInit={setReactFlowInstance}
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        nodeTypes={nodeTypes}
                        defaultEdgeOptions={defaultEdgeOptions}
                        isValidConnection={isValidConnection}
                        connectionLineComponent={ConnectionLine}
                        fitView
                        deleteKeyCode="Delete"
                    >
                        <Controls />
                        <Background variant="dots" gap={12} size={1} />

                        {/* --- ОПРЕДЕЛЕНИЯ ВСЕХ МАРКЕРОВ --- */}
                        <svg style={{ position: 'absolute', width: 0, height: 0 }}>
                            <defs>
                                {/* 1. Полная стрелка (стандартная) */}
                                <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                    <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
                                </marker>

                                {/* 2. Пустая стрелка (треугольник без заливки) */}
                                <marker id="arrow-hollow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                    <path d="M 0 0 L 10 5 L 0 10 z" fill="white" stroke="currentColor" strokeWidth="1.5"/>
                                </marker>

                                {/* 3. Круг (закрашенный) */}
                                <marker id="circle" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                                    <circle cx="5" cy="5" r="4" fill="currentColor" />
                                </marker>

                                {/* 4. Полый круг */}
                                <marker id="circle-hollow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                                    <circle cx="5" cy="5" r="3.5" fill="white" stroke="currentColor" strokeWidth="1" />
                                </marker>

                                {/* 5. Ромб (закрашенный) - Композиция */}
                                <marker id="diamond" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                                    <path d="M 0 5 L 5 0 L 10 5 L 5 10 z" fill="currentColor" stroke="currentColor"/>
                                </marker>

                                {/* 6. Полый ромб - Агрегация */}
                                <marker id="diamond-hollow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                                    <path d="M 0 5 L 5 0 L 10 5 L 5 10 z" fill="white" stroke="currentColor"/>
                                </marker>
                            </defs>
                        </svg>
                    </ReactFlow>
                </ReactFlowProvider>
            </div>

            <Inspector
                isOpen={isInspectorOpen}
                onToggle={() => setIsInspectorOpen(!isInspectorOpen)}
                selectedNode={selectedNode}
                selectedEdge={selectedEdge}
                onNodeChange={handleNodeChange}
                onEdgeChange={handleEdgeChange}
                showHandles={showHandles}
                onToggleHandles={() => setShowHandles(!showHandles)}
            />
        </div>
    );
}

export default App;