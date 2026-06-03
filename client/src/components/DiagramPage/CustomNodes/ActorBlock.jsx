import React, { memo } from 'react';
import { NodeResizer } from 'reactflow';
import { useEditableNode } from '../../../hooks/useEditableNode';
import { UniversalHandles } from './shared';

export const ActorBlock = memo(({ data, id, selected, style }) => {
    const { isEditing, label, inputProps, wrapperProps } = useEditableNode(data.label, data, id);
    const nodeStyle = data.nodeStyle || {};
    const strokeColor = nodeStyle.borderColor || '#555';
    const fillColor = nodeStyle.background || '#fff';
    const textStyle = data.textStyle || {};

    return (
        <div {...wrapperProps} style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', background: 'transparent', paddingTop: '5px', boxSizing: 'border-box' }}>
            <NodeResizer color={strokeColor} isVisible={selected} minWidth={40} minHeight={80} />
            <UniversalHandles />
            <svg width="100%" height="70%" viewBox="0 0 100 150" preserveAspectRatio="xMidYMid meet" style={{ flexShrink: 0, overflow: 'visible' }}>
                <circle cx="50" cy="25" r="20" fill={fillColor} stroke={strokeColor} strokeWidth="3" />
                <line x1="50" y1="45" x2="50" y2="100" stroke={strokeColor} strokeWidth="3" />
                <line x1="20" y1="70" x2="80" y2="70" stroke={strokeColor} strokeWidth="3" />
                <line x1="50" y1="100" x2="20" y2="150" stroke={strokeColor} strokeWidth="3" />
                <line x1="50" y1="100" x2="80" y2="150" stroke={strokeColor} strokeWidth="3" />
            </svg>
            <div style={{ marginTop: '5px', width: '100%', textAlign: 'center', maxHeight: '30%' }}>
                {isEditing ? (
                    <input {...inputProps} style={{ border: 'none', background: 'transparent', outline: 'none', textAlign: 'center', fontSize: textStyle.fontSize || '12px', color: textStyle.color || '#000', width: '100%' }} />
                ) : (
                    <span style={{ fontSize: textStyle.fontSize || '12px', color: textStyle.color || '#000' }}>{label}</span>
                )}
            </div>
        </div>
    );
});