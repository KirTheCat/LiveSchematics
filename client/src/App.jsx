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

import Toolbar from './Toolbar';
import { DefaultBlock, CircleBlock, CloudBlock, TextBlock } from './CustomNodes';

const nodeTypes = {
    default: DefaultBlock,
    circle: CircleBlock,
    cloud: CloudBlock,
    textblock: TextBlock,
};

const initialNodes = [];
const initialEdges = [];

function App() {
    const [nodes, setNodes] = useState(initialNodes);
    const [edges, setEdges] = useState(initialEdges);
    const reactFlowWrapper = useRef(null);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);
    const idCounter = useRef(1); // Счетчик для нумерации

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
                let label = type === 'textblock' ? `Текст ${currentId}` : `Текст ${currentId}`;
                if (type !== 'textblock') {

                } else {

                }

                const newNode = {
                    id: `node-${currentId}`,
                    type: type,
                    position: position,
                    data: {
                        label: label,
                        isNew: type === 'textblock',
                        onDelete: type === 'textblock' ? deleteNode : undefined
                    },
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
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onInit={setReactFlowInstance}
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        nodeTypes={nodeTypes}
                        fitView
                    >
                        <Controls />
                        <Background variant="dots" gap={12} size={1} />
                    </ReactFlow>
                </ReactFlowProvider>
            </div>
        </div>
    );
}

export default App;