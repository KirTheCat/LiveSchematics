import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import ReactFlow, { ReactFlowProvider, Controls, Background } from 'reactflow';
import Toolbar from '../components/Toolbar';
import Inspector from '../components/Inspector';
import Header from '../components/Header';
import { ConnectionLine } from '../components/ConnectionLine';
import MarkerDefinitions from '../components/MarkerDefinitions';
import { useDiagram } from '../hooks/useDiagram';
import { nodeTypes as importedNodeTypes } from '../types/nodeTypes';
import Chat from '../components/Chat';
import ContextMenu from '../components/ContextMenu';
import { socket } from '../hooks/useDiagram/useSync';
import '../App.css';
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

    useEffect(() => {
        if (!location.state?.username) {
            navigate('/');
        }
    }, [location.state, navigate]);

    const user = useMemo(() => ({
        username: location.state?.username || 'Guest',
        roomName: location.state?.roomName
    }), [location.state]);

    const handleJoinError = useCallback((error) => {
        alert(error.message);
        navigate('/');
    }, [navigate]);

    const diagramLogic = useDiagram(roomId, user, handleJoinError);
    const nodeTypes = useMemo(() => importedNodeTypes, []);

    const handleLeaveClick = () => {
        socket.emit('check-last-user', roomId, (isLast) => {
            setIsLastUser(isLast);
            setShowLeaveModal(true);
        });
    };

    const confirmLeave = (save) => {
        if (save) {
            diagramLogic.saveDiagram();
        }
        socket.emit('leave-room');
        navigate('/');
    };

    const onNodeContextMenu = useCallback((event, node) => {
        event.preventDefault();
        setContextMenu({ x: event.clientX, y: event.clientY, nodeId: node.id });
    }, []);

    const closeContextMenu = useCallback(() => setContextMenu(null), []);

    if (!location.state?.username) {
        return null;
    }

    return (
        <div style={styles.container}>
            <Header
                onSave={diagramLogic.saveDiagram}
                onLoad={diagramLogic.loadDiagram}
                onUndo={diagramLogic.undo}
                onRedo={diagramLogic.redo}
                onLeave={handleLeaveClick}
            />

            <div style={styles.mainArea}>
                <Toolbar />

                <div style={styles.canvasWrapper}>
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

            {showLeaveModal && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modal}>
                        <h3>Выход из комнаты</h3>

                        {isLastUser ? (
                            <>
                                <p>Вы последний участник. Комната будет удалена.</p>
                                <p>Сохранить схему?</p>
                                <div style={styles.modalButtons}>
                                    <button
                                        style={styles.btnSecondary}
                                        onClick={() => setShowLeaveModal(false)}
                                    >
                                        Отмена
                                    </button>
                                    <button
                                        style={styles.btnDanger}
                                        onClick={() => confirmLeave(false)}
                                    >
                                        Выйти без сохранения
                                    </button>
                                    <button
                                        style={styles.btnSuccess}
                                        onClick={() => confirmLeave(true)}
                                    >
                                        Сохранить и выйти
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <p>Выйти из комнаты?</p>
                                <div style={styles.modalButtons}>
                                    <button
                                        style={styles.btnSecondary}
                                        onClick={() => setShowLeaveModal(false)}
                                    >
                                        Отмена
                                    </button>
                                    <button
                                        style={styles.btnDanger}
                                        onClick={() => confirmLeave(false)}
                                    >
                                        Выйти
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        backgroundColor: '#f0f2f5'
    },
    mainArea: {
        display: 'flex',
        flexGrow: 1,
        height: 'calc(100% - 60px)',
        overflow: 'hidden'
    },
    canvasWrapper: {
        flexGrow: 1,
        position: 'relative',
        height: '100%',
        overflow: 'hidden'
    },
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2000
    },
    modal: {
        background: '#fff',
        padding: '20px',
        borderRadius: '8px',
        width: '400px',
        boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
        textAlign: 'center'
    },
    modalButtons: {
        marginTop: '20px',
        display: 'flex',
        justifyContent: 'center',
        gap: '10px'
    },
    btnSecondary: {
        padding: '8px 16px',
        border: '1px solid #ccc',
        background: '#fff',
        borderRadius: '4px',
        cursor: 'pointer'
    },
    btnDanger: {
        padding: '8px 16px',
        border: 'none',
        background: '#dc3545',
        color: '#fff',
        borderRadius: '4px',
        cursor: 'pointer'
    },
    btnSuccess: {
        padding: '8px 16px',
        border: 'none',
        background: '#28a745',
        color: '#fff',
        borderRadius: '4px',
        cursor: 'pointer'
    }
};

export default DiagramPage;