import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import ReactFlow, { ReactFlowProvider, Controls, Background } from 'reactflow';

import Toolbar from '../components/DiagramPage/Toolbar';
import Inspector from '../components/DiagramPage/Inspector';
import Header from '../components/DiagramPage/Header';
import { ConnectionLine } from '../components/DiagramPage/ConnectionLine';
import MarkerDefinitions from '../components/DiagramPage/MarkerDefinitions';
import Chat from '../components/DiagramPage/Chat';
import ContextMenu from '../components/DiagramPage/ContextMenu';
import LeaveRoomModal from '../components/Modals/LeaveRoomModal';

import { useDiagram } from '../hooks/useDiagram';
import { nodeTypes as importedNodeTypes } from '../types/nodeTypes';

import styles from './DiagramPage.module.css';
import 'reactflow/dist/style.css';

const defaultEdgeOptions = {
    type: 'smoothstep',
    markerEnd: 'arrow',
    style: { strokeWidth: 2, stroke: '#333' }
};

const DiagramPage = () => {
    const { roomId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [isLastUser, setIsLastUser] = useState(false);
    const [isInspectorOpen, setIsInspectorOpen] = useState(true);
    const [showHandles, setShowHandles] = useState(true);
    const [contextMenu, setContextMenu] = useState(null);

    const user = useMemo(() => {
        if (!location.state?.username) return null;
        return {
            username: location.state.username,
            roomName: location.state.roomName
        };
    }, [location.state]);

    useEffect(() => {
        if (!user) navigate('/');
    }, [user, navigate]);

    const handleJoinError = useCallback((error) => {
        alert(error.message);
        navigate('/');
    }, [navigate]);

    const diagramLogic = useDiagram(roomId, user, handleJoinError);
    const nodeTypes = useMemo(() => importedNodeTypes, []);

    const handleLeaveClick = () => {

        if (diagramLogic.checkLastUser) {
            diagramLogic.checkLastUser((isLast) => {
                setIsLastUser(isLast);
                setShowLeaveModal(true);
            });
        }
    };

    const confirmLeave = (save) => {
        if (save) {
            diagramLogic.saveDiagram();
        }
        if (diagramLogic.leaveRoom) {
            diagramLogic.leaveRoom();
        }
        navigate('/');
    };

    const onNodeContextMenu = useCallback((event, node) => {
        event.preventDefault();
        setContextMenu({ x: event.clientX, y: event.clientY, nodeId: node.id });
    }, []);

    const closeContextMenu = useCallback(() => setContextMenu(null), []);

    if (!user) return null;

    return (
        <div className={styles.container}>
            <Header
                onSave={diagramLogic.saveDiagram}
                onLoad={diagramLogic.loadDiagram}
                onUndo={diagramLogic.undo}
                onRedo={diagramLogic.redo}
                onLeave={handleLeaveClick}
            />

            <div className={styles.mainArea}>
                <Toolbar />

                <div className={styles.canvasWrapper}>
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
                            onNodeDragStart={diagramLogic.onNodeDragStart}
                            onNodeDragStop={diagramLogic.onNodeDragStop}
                            nodeTypes={nodeTypes}
                            defaultEdgeOptions={defaultEdgeOptions}
                            isValidConnection={diagramLogic.isValidConnection}
                            connectionLineComponent={ConnectionLine}
                            fitView
                            deleteKeyCode="Delete"
                            onNodeContextMenu={onNodeContextMenu}
                        >
                            <Controls />
                            <Background variant="dots" gap={12} size={1} />
                            <MarkerDefinitions />
                        </ReactFlow>

                        {contextMenu && (
                            <ContextMenu
                                x={contextMenu.x}
                                y={contextMenu.y}
                                nodeId={contextMenu.nodeId}
                                onClose={closeContextMenu}
                                onDuplicate={diagramLogic.duplicateNode}
                                onDelete={diagramLogic.deleteNode}
                            />
                        )}
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

            <Chat roomId={roomId} user={user} />

            <LeaveRoomModal
                isOpen={showLeaveModal}
                isLastUser={isLastUser}
                onClose={() => setShowLeaveModal(false)}
                onConfirm={confirmLeave}
            />
        </div>
    );
};

export default DiagramPage;