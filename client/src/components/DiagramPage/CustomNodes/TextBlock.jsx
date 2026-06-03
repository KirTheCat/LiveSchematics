import React, { useState, useEffect, memo } from 'react';
import { UniversalHandles } from './shared';
import { useRef } from 'react';

export const TextBlock = memo(({ data, id, selected, style }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [label, setLabel] = useState(data.label);
    const inputRef = useRef(null); // Не забудьте импорт useRef, если его нет в хуке

    useEffect(() => { setLabel(data.label); }, [data.label]);
    useEffect(() => { if (isEditing) inputRef.current?.focus(); }, [isEditing]);

    const handleBlur = () => {
        setIsEditing(false);
        if (label.trim() === '') {
            if (data.onDelete) data.onDelete(id);
        } else {
            data.label = label;
        }
    };

    const nodeStyle = { ...(style || {}), ...(data.nodeStyle || {}) };
    const textStyle = data.textStyle || {};
    const isNested = !!data.parentId;

    const currentStyle = isNested ? {
        width: nodeStyle.width || '100%', height: nodeStyle.height || 25, background: nodeStyle.background || '#f8f9fa',
        border: 'none', borderBottom: '1px solid #dee2e6', borderRadius: 0, cursor: 'move'
    } : {
        width: '100%', height: '100%', background: nodeStyle.background || 'transparent',
        border: selected ? '1px dashed #ccc' : 'none', borderRadius: '2px'
    };

    return (
        <div onDoubleClick={() => setIsEditing(true)} style={{ ...currentStyle, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: isNested ? 'left' : 'center', padding: '0 5px', overflow: 'hidden', color: textStyle.color || '#000' }}>
            {!isNested && <UniversalHandles />}
            {isEditing ? (
                <input ref={inputRef} value={label} onChange={(e) => setLabel(e.target.value)} onBlur={handleBlur} onKeyDown={(e) => e.key === 'Enter' && handleBlur()} style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: textStyle.fontSize || '14px', width: '100%', color: 'inherit' }} />
            ) : (
                <div style={{ fontSize: textStyle.fontSize || '14px', width: '100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'inherit' }}>{label}</div>
            )}
        </div>
    );
});

