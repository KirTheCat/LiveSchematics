import React, { useState, useEffect, memo } from 'react';
import { NodeResizer } from 'reactflow';
import { UniversalHandles } from './shared';

export const GroupBlock = memo(({ data, id, selected, style }) => {
    const nodeStyle = style || {};
    const [label, setLabel] = useState(data.label || "Группа");
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => { data.label = label; }, [label]);

    return (
        <div style={{ width: '100%', height: '100%', background: nodeStyle.background || 'rgba(240, 240, 240, 0.5)', border: `2px dashed ${nodeStyle.borderColor || '#aaa'}`, borderRadius: '10px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', pointerEvents: 'none', zIndex: -1 }}>
            <NodeResizer color="#aaa" isVisible={selected} minWidth={200} minHeight={150} />
            <UniversalHandles />
            <div onDoubleClick={() => setIsEditing(true)} style={{ padding: '5px 10px', borderBottom: `1px dashed ${nodeStyle.borderColor || '#aaa'}`, fontWeight: 'bold', color: '#555', pointerEvents: 'auto', cursor: 'pointer' }}>
                {isEditing ? (
                    <input value={label} onChange={(e) => setLabel(e.target.value)} onBlur={() => setIsEditing(false)} autoFocus style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontWeight: 'bold', color: '#555' }} />
                ) : ( label )}
            </div>
            <div style={{ flexGrow: 1 }}></div>
        </div>
    );
});