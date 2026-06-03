import React, { memo } from 'react';
import { NodeResizer } from 'reactflow';
import { useEditableNode } from '../../../hooks/useEditableNode';
import { UniversalHandles } from './shared';

export const DiamondBlock = memo(({ data, id, selected, style }) => {
    const { isEditing, label, inputProps, wrapperProps } = useEditableNode(data.label, data, id);
    const nodeStyle = data.nodeStyle || {};
    const strokeColor = nodeStyle.borderColor || '#555';
    const fillColor = nodeStyle.background || '#fff';
    const textStyle = data.textStyle || {};

    return (
        <div {...wrapperProps} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', overflow: 'hidden' }}>
            <NodeResizer color={strokeColor} isVisible={selected} minWidth={80} minHeight={80} />
            <UniversalHandles />
            <div style={{ width: '70%', height: '70%', background: fillColor, border: `2px solid ${strokeColor}`, transform: 'rotate(45deg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ transform: 'rotate(-45deg)', textAlign: 'center', width: '100%' }}>
                    {isEditing ? (
                        <input {...inputProps} style={{ border: 'none', background: 'transparent', outline: 'none', textAlign: 'center', fontSize: textStyle.fontSize || '12px', color: textStyle.color || '#000', width: '100%' }} />
                    ) : (
                        <span style={{ fontSize: textStyle.fontSize || '12px', color: textStyle.color || '#000' }}>{label}</span>
                    )}
                </div>
            </div>
        </div>
    );
});