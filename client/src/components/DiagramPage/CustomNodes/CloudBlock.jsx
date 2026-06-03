import React, { memo } from 'react';
import { NodeResizer } from 'reactflow';
import { useEditableNode } from '../../../hooks/useEditableNode';
import { inputStyle, UniversalHandles } from './shared';

export const CloudBlock = memo(({ data, id, selected, style }) => {
    const { isEditing, inputProps, wrapperProps } = useEditableNode(data.label, data, id);
    const nodeStyle = data.nodeStyle || {};
    const textStyle = data.textStyle || {};
    const fillColor = nodeStyle.background || '#e3f2fd';
    const strokeColor = nodeStyle.borderColor || '#90caf9';

    return (
        <div {...wrapperProps} style={{ width: '100%', height: '100%', background: fillColor, border: `2px solid ${strokeColor}`, borderRadius: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: selected ? `0 0 10px ${strokeColor}40` : 'none', overflow: 'hidden', boxSizing: 'border-box', padding: '10px' }}>
            <NodeResizer color={strokeColor} isVisible={selected} minWidth={80} minHeight={50} />
            <UniversalHandles />
            {isEditing ? (
                <textarea {...inputProps} style={{ ...inputStyle, color: textStyle.color || '#000', fontSize: textStyle.fontSize || '12px' }} />
            ) : (
                <div style={{ ...inputStyle, color: textStyle.color || '#000', fontSize: textStyle.fontSize || '12px' }}>
                    {inputProps.value}
                </div>
            )}
        </div>
    );
});