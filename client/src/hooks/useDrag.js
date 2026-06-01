//hooks/useDrag.js
import { useCallback, useRef } from 'react';
import { handleDropOnClass } from './useDiagram/utils';
import { HEADER_HEIGHT } from './useDiagram/constants';

const getAbsolutePosition = (node, nodesList) => {
    let x = node.position.x;
    let y = node.position.y;
    let current = node;
    while (current.parentId) {
        const parent = nodesList.find(n => n.id === current.parentId);
        if (!parent) break;
        x += parent.position.x;
        y += parent.position.y;
        current = parent;
    }
    return { x, y };
};

export const useDrag = (nodesRef, setNodes, pushToHistory, edgesRef, rfInstance) => {
    const dragStartPosRef = useRef(null);

    const onNodeDragStart = useCallback((e, node) => {
        dragStartPosRef.current = { x: node.position.x, y: node.position.y };
    }, []);

    const onNodeDrag = useCallback((event, node) => {
        if (node.type !== 'textblock') return;

        const absPos = getAbsolutePosition(node, nodesRef.current);
        const nodeCenterX = absPos.x + (node.width || 150) / 2;
        const nodeCenterY = absPos.y + (node.height || 40) / 2;

        const target = nodesRef.current.find(n => {
            if (n.type !== 'class') return false;
            const tAbs = getAbsolutePosition(n, nodesRef.current);
            const tW = n.style?.width || 200;
            const tH = n.style?.height || 200;
            return (
                nodeCenterX > tAbs.x && nodeCenterX < tAbs.x + tW &&
                nodeCenterY > tAbs.y && nodeCenterY < tAbs.y + tH
            );
        });

        setNodes(nds => nds.map(n => {
            if (n.type === 'class') {
                let newZone = null;
                if (n.id === target?.id) {
                    const tAbs = getAbsolutePosition(n, nds);
                    const relY = nodeCenterY - tAbs.y;
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

    }, [nodesRef, setNodes]);

    const onNodeDragStop = useCallback((event, node) => {
        setNodes(nds => nds.map(n => {
            if (n.type === 'class' && n.data.activeDropZone) {
                return { ...n, data: { ...n.data, activeDropZone: null } };
            }
            return n;
        }));

        if (node.type !== 'textblock') return;

        const startPos = dragStartPosRef.current;
        const moved = startPos && (startPos.x !== node.position.x || startPos.y !== node.position.y);

        if (!rfInstance) return;

        const mousePos = rfInstance.screenToFlowPosition({
            x: event.clientX,
            y: event.clientY
        });

        const targetClass = nodesRef.current.find(n => {
            if (n.type !== 'class') return false;
            const tAbs = getAbsolutePosition(n, nodesRef.current);
            const tH = n.style?.height || 200;
            const tW = n.style?.width || 200;
            return (
                mousePos.x > tAbs.x && mousePos.x < tAbs.x + tW &&
                mousePos.y > tAbs.y && mousePos.y < tAbs.y + tH
            );
        });

        if (targetClass) {
            setNodes(nds => {
                const newNodes = handleDropOnClass(nds, node, targetClass, mousePos.x, mousePos.y);
                pushToHistory(newNodes, edgesRef.current, "Drop into Class");
                return newNodes;
            });
        } else {
            if (node.parentId) {
                setNodes(nds => {

                    const finalX = mousePos.x - (node.width || 150) / 2;
                    const finalY = mousePos.y - (node.height || 40) / 2;

                    const newNodes = nds.map(n => n.id === node.id ? {
                        ...n,
                        parentId: undefined,
                        extent: undefined,
                        position: { x: finalX, y: finalY },
                        style: { ...n.style, width: 150, height: 40 },
                        data: { ...n.data, parentId: null }
                    } : n);

                    pushToHistory(newNodes, edgesRef.current, "Drop out of Class");
                    return newNodes;
                });
            } else if (moved) {
                pushToHistory(null, null, "Move Node");
            }
        }

        dragStartPosRef.current = null;
    }, [nodesRef, setNodes, pushToHistory, edgesRef, rfInstance]);

    return { onNodeDragStart, onNodeDrag, onNodeDragStop };
};