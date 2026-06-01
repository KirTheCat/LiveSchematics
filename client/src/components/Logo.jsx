import React from 'react';

export const Logo = ({ size = 40 }) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 256 256"
            xmlns="http://www.w3.org/2000/svg"
            style={{ borderRadius: '8px' }}
        >
            <defs>
                <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="50%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#F97316" />
                </linearGradient>
            </defs>
            <rect x="0" y="0" width="256" height="256" rx="40" fill="url(#bgGradient)" />
            <g stroke="#FFFFFF" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <line x1="80" y1="80" x2="176" y2="80" />
                <line x1="176" y1="80" x2="176" y2="144" />
                <line x1="112" y1="160" x2="80" y2="128" />
            </g>
            <rect x="64" y="64" width="32" height="32" rx="4" fill="#3B82F6" />
            <circle cx="176" cy="80" r="18" fill="#F97316" />
            <rect x="128" y="144" width="64" height="32" rx="6" fill="#22C55E" />
            <polygon points="80,112 96,128 80,144 64,128" fill="#EF4444" />
        </svg>
    );
};