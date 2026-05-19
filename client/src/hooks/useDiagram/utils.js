// src/hooks/useDiagram/utils.js
import { HEADER_HEIGHT, TEXT_BLOCK_HEIGHT, PADDING, NODE_CONFIG } from './constants';

export const createNode = (type, position, id, deleteNode) => {
    const config = NODE_CONFIG[type] || {};
    const label = `${config.label || 'Блок'} ${id}`;

    return {
        id: `node-${id}`,
        type,
        position,
        style: {
            width: 150, height: 80, background: 'transparent',
            ...config.style
        },
        data: {
            label,
            isNew: false,
            textStyle: { color: '#000', fontSize: '14px' },
            nodeStyle: { background: '#fff', borderColor: '#555' },
            ...config.data,
            ...(type === 'textblock' && { isNew: true, onDelete: deleteNode }),
        },
    };
};

export const getDropTarget = (node, nodes) => {
    if (node.type !== 'textblock') return null;

    const nodeCenterX = node.position.x + (node.width || 150) / 2;
    const nodeCenterY = node.position.y + (node.height || 40) / 2;

    return nodes.find(n => {
        if (n.type !== 'class') return false;
        const tW = n.style?.width || 200;
        const tH = n.style?.height || 200;
        return (
            nodeCenterX > n.position.x && nodeCenterX < n.position.x + tW &&
            nodeCenterY > n.position.y && nodeCenterY < n.position.y + tH
        );
    });
};

export const handleDropOnClass = (nodes, node, target) => {
    const nodeIndex = nodes.findIndex(n => n.id === node.id);
    const targetIndex = nodes.findIndex(n => n.id === target.id);
    if (nodeIndex === -1 || targetIndex === -1) return nodes;

    let newNodes = [...nodes];
    let targetNode = newNodes[targetIndex];
    let splitY = targetNode.data.splitY || (HEADER_HEIGHT + (targetNode.style?.height || 200) - HEADER_HEIGHT) / 2;

    const mouseRelY = (node.position.y + (node.height || 40) / 2) - targetNode.position.y;
    const isMethods = mouseRelY > splitY;

    const siblings = newNodes.filter(n =>
        n.parentId === target.id && n.id !== node.id
    ).filter(n => {
        const sibY = n.position.y;
        return isMethods ? sibY >= splitY : sibY < splitY && sibY >= HEADER_HEIGHT;
    });

    let nextY = (isMethods ? splitY : HEADER_HEIGHT) + PADDING;
    if (siblings.length > 0) {
        siblings.sort((a, b) => a.position.y - b.position.y);
        const last = siblings[siblings.length - 1];
        nextY = last.position.y + (last.height || TEXT_BLOCK_HEIGHT) + PADDING;
    }

    const textBottom = nextY + TEXT_BLOCK_HEIGHT;
    let newHeight = targetNode.style?.height || 250;
    let newSplitY = splitY;
    let shiftDelta = 0;

    if (!isMethods) {
        if (textBottom > splitY - PADDING) {
            newSplitY = textBottom + PADDING;
            const oldMethodsHeight = newHeight - splitY;
            newHeight = newSplitY + oldMethodsHeight;
            shiftDelta = newSplitY - splitY;
        }
    } else {
        if (textBottom > newHeight - PADDING) {
            newHeight = textBottom + 20;
        }
    }

    targetNode = {
        ...targetNode,
        style: { ...targetNode.style, height: newHeight },
        data: { ...targetNode.data, splitY: newSplitY }
    };
    newNodes[targetIndex] = targetNode;

    if (shiftDelta > 0) {
        newNodes = newNodes.map(n => {
            if (n.parentId === target.id && n.id !== node.id && n.position.y >= splitY) {
                return { ...n, position: { ...n.position, y: n.position.y + shiftDelta } };
            }
            return n;
        });
    }

    const classWidth = targetNode.style?.width || 200;
    newNodes[nodeIndex] = {
        ...newNodes[nodeIndex],
        parentId: target.id,
        extent: 'parent',
        position: { x: PADDING, y: nextY },
        style: { ...newNodes[nodeIndex].style, width: classWidth - PADDING * 2, height: TEXT_BLOCK_HEIGHT },
        data: { ...newNodes[nodeIndex].data, parentId: target.id }
    };

    return newNodes;
};