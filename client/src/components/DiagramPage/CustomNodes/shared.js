import React from 'react';
import { Handle, Position } from 'reactflow';

export const inputStyle = {
    width: '100%',
    height: '100%',
    border: 'none',
    background: 'transparent',
    boxShadow: 'none',
    borderRadius: 0,
    textAlign: 'center',
    outline: 'none',
    fontFamily: 'sans-serif',
    padding: '10px',
    resize: 'none',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    wordBreak: 'break-word',
    boxSizing: 'border-box'
};

export const UniversalHandles = () => (
    <>
        <Handle type="target" position={Position.Top} id="top-t" style={{ background: '#555' }} />
        <Handle type="source" position={Position.Top} id="top-s" style={{ background: '#555' }} />
        <Handle type="target" position={Position.Bottom} id="bottom-t" style={{ background: '#555' }} />
        <Handle type="source" position={Position.Bottom} id="bottom-s" style={{ background: '#555' }} />
        <Handle type="target" position={Position.Left} id="left-t" style={{ background: '#555' }} />
        <Handle type="source" position={Position.Left} id="left-s" style={{ background: '#555' }} />
        <Handle type="target" position={Position.Right} id="right-t" style={{ background: '#555' }} />
        <Handle type="source" position={Position.Right} id="right-s" style={{ background: '#555' }} />
    </>
);