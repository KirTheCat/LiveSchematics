import React, { memo } from 'react';
import { NodeResizer } from 'reactflow';
import { useEditableNode } from '../../../hooks/useEditableNode';
import { inputStyle, UniversalHandles } from './shared';

export const DefaultBlock = memo(({ data, id, selected, style }) => {
    const { isEditing, inputProps, wrapperProps } = useEditableNode(data.label, data, id);
    const nodeStyle = { ...(style || {}), ...(data.nodeStyle || {}) };
    const textStyle = data.textStyle || {};

    return (
        <div {...wrapperProps} style={{ width: '100%', height: '100%', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <NodeResizer color={nodeStyle.borderColor || '#007bff'} isVisible={selected} minWidth={80} minHeight={40} />
            <UniversalHandles />
            {isEditing ? (
                <textarea {...inputProps} style={{ ...inputStyle, color: textStyle.color || '#000', fontSize: textStyle.fontSize || '14px' }} />
            ) : (
                <div style={{ ...inputStyle, color: textStyle.color || '#000', fontSize: textStyle.fontSize || '14px' }}>
                    {inputProps.value}
                </div>
            )}
        </div>
    );
});