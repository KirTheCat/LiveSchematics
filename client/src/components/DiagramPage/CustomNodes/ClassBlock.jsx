import React, { useState, useEffect, memo } from 'react';
import { NodeResizer } from 'reactflow';
import { UniversalHandles } from './shared';

export const ClassBlock = memo(({ data, id, selected, style }) => {
    const nodeStyle = { ...(style || {}), ...(data.nodeStyle || {}) };
    const textStyle = data.textStyle || {};
    const [name, setName] = useState(data.label || 'ClassName');
    useEffect(() => { data.label = name; }, [name]);

    const activeZone = data.activeDropZone;
    const classHeight = nodeStyle.height || 200;
    const splitY = data.splitY || (40 + (classHeight - 40)/2);

    const getZoneStyle = (zoneName) => {
        const isActive = activeZone === zoneName;
        return {
            position: 'absolute', left: 0, right: 0, overflow: 'hidden', zIndex: 1, boxSizing: 'border-box',
            background: isActive ? 'rgba(34,105,184,0.82)' : 'transparent',
            border: isActive ? '2px dashed #007bff' : 'none',
            transition: 'background 0.2s, border 0.2s',
        };
    };

    return (
        <div style={{ width: '100%', height: '100%', background: nodeStyle.background || '#fff', border: `2px solid ${nodeStyle.borderColor || '#555'}`, borderRadius: '4px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', minWidth: '200px', minHeight: '200px', position: 'relative', transition: 'height 0.2s ease' }}>
            <NodeResizer color="#555" isVisible={selected} minWidth={200} minHeight={150} />
            <UniversalHandles />
            <div style={{ height: '40px', position: 'absolute', top: 0, left: 0, right: 0, borderBottom: `2px solid ${nodeStyle.borderColor || '#555'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa', zIndex: 2 }}>
                <input value={name} onChange={(e) => setName(e.target.value)} style={{ width: '90%', border: 'none', background: 'transparent', outline: 'none', textAlign: 'center', fontWeight: 'bold', fontSize: '14px', color: textStyle.color || '#000' }} />
            </div>
            <div style={{ ...getZoneStyle('attributes'), top: '40px', height: `${splitY - 40}px`, borderBottom: `2px solid ${nodeStyle.borderColor || '#555'}` }} />
            <div style={{ ...getZoneStyle('methods'), top: `${splitY}px`, bottom: 0 }} />
        </div>
    );
});