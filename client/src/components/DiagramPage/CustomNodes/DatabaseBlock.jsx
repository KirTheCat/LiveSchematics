import React, { memo } from 'react';
import { NodeResizer } from 'reactflow';
import { useEditableNode } from '../../../hooks/useEditableNode';
import { UniversalHandles } from './shared';

export const DatabaseBlock = memo(({ data, id, selected, style }) => {
    const { isEditing, label, inputProps, wrapperProps } = useEditableNode(data.label, data, id);
    const nodeStyle = data.nodeStyle || {};
    const strokeColor = nodeStyle.borderColor || '#555';
    const fillColor = nodeStyle.background || '#fff';
    const textStyle = data.textStyle || {};

    return (
        <div {...wrapperProps} style={{ width: '110%', height: '110%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent' }}>
            <NodeResizer color={strokeColor} isVisible={selected} minWidth={60} minHeight={60} />
            <UniversalHandles />
            <svg width="100%" height="100%" viewBox="-2 -5 105 130" preserveAspectRatio="none" style={{ position: 'absolute', top: 0, left: 0 }}>
                <path d="M0,20 Q0,0 50,0 Q100,0 100,20 L100,90 Q100,110 50,110 Q0,110 0,90 L0,20 Z" fill={fillColor} stroke={strokeColor} strokeWidth="2" />
                <ellipse cx="50" cy="20" rx="50" ry="20" fill={fillColor} stroke={strokeColor} strokeWidth="2" />
            </svg>
            <div style={{ position: 'relative', zIndex: 1, padding: '35px 10px 10px 10px', textAlign: 'center', width: '100%' }}>
                {isEditing ? (
                    <textarea {...inputProps} style={{ border: 'none', background: 'transparent', outline: 'none', textAlign: 'center', fontSize: textStyle.fontSize || '12px', color: textStyle.color || '#000', width: '100%', resize: 'none' }} />
                ) : (
                    <div style={{ fontSize: textStyle.fontSize || '12px', fontWeight: 'bold', color: textStyle.color || '#000' }}>{label}</div>
                )}
            </div>
        </div>
    );
});