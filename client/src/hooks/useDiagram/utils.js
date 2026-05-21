//src/hooks/useDiagram/utils.js
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

export const handleDropOnClass = (nodes, node, target, nodeCenterX, nodeCenterY) => {
    const nodeIndex = nodes.findIndex(n => n.id === node.id);
    const targetIndex = nodes.findIndex(n => n.id === target.id);
    if (nodeIndex === -1 || targetIndex === -1) return nodes;

    let newNodes = [...nodes];
    let targetNode = newNodes[targetIndex];
    let oldClassHeight = targetNode.style?.height || 200;

    let splitY = targetNode.data.splitY;
    if (!splitY) {
        splitY = HEADER_HEIGHT + (oldClassHeight - HEADER_HEIGHT) / 2;
        targetNode = { ...targetNode, data: { ...targetNode.data, splitY } };
        newNodes[targetIndex] = targetNode;
    }

    const mouseRelY = nodeCenterY - targetNode.position.y;
    const isMethods = mouseRelY > splitY;

    const siblings = newNodes.filter(n =>
        n.parentId === target.id && n.id !== node.id
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
            if (n.parentId === target.id && n.id !== node.id) {
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
        parentId: target.id,
        extent: 'parent',
        position: { x: PADDING, y: nextY },
        style: { ...newNodes[nodeIndex].style, width: classWidth - PADDING * 2, height: TEXT_BLOCK_HEIGHT },
        data: { ...newNodes[nodeIndex].data, parentId: target.id }
    };

    return newNodes;
};