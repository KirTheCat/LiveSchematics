// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const debounce = (fn, ms) => {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            timer = null;
            fn(...args);
        }, ms);
    };
};

const _ResizeObserver = window.ResizeObserver;
window.ResizeObserver = class ResizeObserver extends _ResizeObserver {
    constructor(callback) {
        callback = debounce(callback, 16);
        super(callback);
    }
};

const errorHandler = window.onerror;
window.onerror = (message, source, lineno, colno, error) => {
    if (typeof message === 'string' && message.includes('ResizeObserver loop completed with undelivered notifications')) {
        return true;
    }
    if (errorHandler) {
        return errorHandler(message, source, lineno, colno, error);
    }
    return false;
};

// -------------------------------------------------------------

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);