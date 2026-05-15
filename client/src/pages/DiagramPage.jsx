// src/pages/DiagramPage.jsx
import React, { useState, useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import ReactFlow, { ReactFlowProvider, Controls, Background } from 'reactflow';

import Toolbar from '../Toolbar';
import Inspector from '../Inspector';
import { ConnectionLine } from '../ConnectionLine';
import MarkerDefinitions from '../components/MarkerDefinitions';
import { useDiagram } from '../hooks/useDiagram';
import { nodeTypes } from '../types/nodeTypes';
import '../App.css';
import 'reactflow/dist/style.css';

const DiagramPage = () => {
    const { roomId } = useParams();
    const location = useLocation();

    const user = useMemo(() => {
        return {
            username: location.state?.username || 'Guest',
            roomName: location.state?.roomName
        };
    }, [location.state]);

    const [isInspectorOpen, setIsInspectorOpen] = useState(true);
    const [showHandles, setShowHandles] = useState(true);

    const diagramLogic = useDiagram(roomId, user);

    const defaultEdgeOptions = {
        type: 'smoothstep', markerEnd: 'arrow', style: { strokeWidth: 2, stroke: '#333' }
    };

    return (
        <div style={{ width: '100vw', height: '100vh', display: 'flex', overflow: 'hidden' }}>
            <Toolbar />
            <div style={{ flexGrow: 1, position: 'relative'}}>
                <ReactFlowProvider>
                    <ReactFlow
                        className={showHandles ? '' : 'hide-handles'}
                        nodes={diagramLogic.nodes}
                        edges={diagramLogic.edges}
                        onNodesChange={diagramLogic.onNodesChange}
                        onEdgesChange={diagramLogic.onEdgesChange}
                        onConnect={diagramLogic.onConnect}
                        onInit={diagramLogic.onInit}
                        onDrop={diagramLogic.onDrop}
                        onDragOver={diagramLogic.onDragOver}
                        nodeTypes={nodeTypes}
                        defaultEdgeOptions={defaultEdgeOptions}
                        isValidConnection={diagramLogic.isValidConnection}
                        connectionLineComponent={ConnectionLine}
                        fitView
                        deleteKeyCode="Delete"
                    >
                        <Controls />
                        <Background variant="dots" gap={12} size={1} />
                        <MarkerDefinitions />
                    </ReactFlow>
                </ReactFlowProvider>
            </div>

            <Inspector
                isOpen={isInspectorOpen}
                onToggle={() => setIsInspectorOpen(!isInspectorOpen)}
                selectedNode={diagramLogic.selectedNode}
                selectedEdge={diagramLogic.selectedEdge}
                onNodeChange={diagramLogic.handleNodeChange}
                onEdgeChange={diagramLogic.handleEdgeChange}
                showHandles={showHandles}
                onToggleHandles={() => setShowHandles(!showHandles)}
                roomInfo={diagramLogic.roomInfo}
            />
        </div>
    );
};

export default DiagramPage;