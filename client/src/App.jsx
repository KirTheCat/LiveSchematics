// App.jsx
import React, { useState, useCallback } from 'react';
import ReactFlow, {
    Controls,
    Background,
    applyNodeChanges,
    applyEdgeChanges,
    addEdge
} from 'reactflow';
import 'reactflow/dist/style.css';
import Toolbar from './Toolbar';

const initialNodes = [];
const initialEdges = [];

function App() {
    const [nodes, setNodes] = useState(initialNodes);
    const [edges, setEdges] = useState(initialEdges);
    const [nodeCount, setNodeCount] = useState(1);

    // Обработчик изменений узлов
    const onNodesChange = useCallback(
        (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
        []
    );

    // Обработчик изменений связей
    const onEdgesChange = useCallback(
        (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        []
    );

    // Обработчик создания новой связи
    const onConnect = useCallback(
        (params) => setEdges((eds) => addEdge(params, eds)),
        []
    );

    // Добавление узла
    const handleAddNode = () => {
        const newNode = {
            id: `node-${nodeCount}`,
            data: { label: `Блок ${nodeCount}` },
            position: { x: Math.random() * 400, y: Math.random() * 400 },
            type: 'default',
        };

        setNodes((nds) => [...nds, newNode]);
        setNodeCount((c) => c + 1);
    };

    //Удаление выбранных элементов
    const handleDeleteSelected = () => {
        setNodes((nds) => nds.filter((node) => !node.selected));
        setEdges((eds) => eds.filter((edge) => !edge.selected));
    };

    return (
        <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Toolbar
                onAddNode={handleAddNode}
                onDeleteSelected={handleDeleteSelected}
            />

            <div style={{ flexGrow: 1 }}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    fitView
                >
                    <Controls />
                    <Background variant="dots" gap={12} size={1} />
                </ReactFlow>
            </div>
        </div>
    );
}

export default App;