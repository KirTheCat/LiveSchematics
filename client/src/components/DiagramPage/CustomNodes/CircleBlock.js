import React, { memo } from 'react';
import { NodeResizer } from 'reactflow';
import { useEditableNode } from '../../../hooks/useEditableNode';
import { inputStyle, UniversalHandles } from './shared';

export const CircleBlock = memo(({ data, id, selected, style }) => {
    const { isEditing, inputProps, wrapperProps } = useEditableNode(data.label, data, id);
    const nodeStyle = data.nodeStyle || {};
    const textStyle = data.textStyle || {};
    const fillColor = nodeStyle.background || '#fff';
    const strokeColor = nodeStyle.borderColor || '#555';

    return (
        <div {...wrapperProps} style={{ width: '100%', height: '100%', background: fillColor, border: `2px solid ${strokeColor}`, borderRadius: '50%', aspectRatio: '1 / 1', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: selected ? `0 0 10px ${strokeColor}50` : 'none', overflow: 'hidden', boxSizing: 'border-box' }}>
            <NodeResizer color={strokeColor} isVisible={selected} minWidth={60} minHeight={60} lockAspectRatio={true} />
            <UniversalHandles />
            {isEditing ? (
                <textarea {...inputProps} style={{ ...inputStyle, color: textStyle.color || '#000', fontSize: textStyle.fontSize || '12px', fontWeight: 'bold' }} />
            ) : (
                <div style={{ ...inputStyle, color: textStyle.color || '#000', fontSize: textStyle.fontSize || '12px', fontWeight: 'bold' }}>
                    {inputProps.value}
                </div>
            )}
        </div>
    );
});