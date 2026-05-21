import React, { useState, useEffect, useRef } from 'react';
import { socket } from '../hooks/useDiagram/useSync';
import '../App.css';

const Chat = ({ roomId, user }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const handleHistory = (history) => {
            setMessages(history);
        };

        const handleChatMessage = (message) => {
            setMessages(prev => [...prev, message]);
        };

        socket.on('chat-history', handleHistory);
        socket.on('chat-message', handleChatMessage);

        return () => {
            socket.off('chat-history', handleHistory);
            socket.off('chat-message', handleChatMessage);
        };
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (input.trim() === '') return;

        socket.emit('send-chat-message', {
            roomId: roomId,
            message: input,
            username: user?.username || 'Guest'
        });

        setInput('');
    };

    const styles = {
        closedContainer: {
            position: 'fixed',
            bottom: '20px',
            left: '130px',
            zIndex: 1000,
        },
        openBtn: {
            padding: '10px 20px',
            borderRadius: '20px',
            border: 'none',
            backgroundColor: '#007bff',
            color: '#fff',
            cursor: 'pointer',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            fontSize: '14px',
            fontWeight: 'bold'
        },
        container: {
            position: 'fixed',
            bottom: '20px',
            left: '130px',
            width: '300px',
            height: '400px',
            backgroundColor: '#fff',
            borderRadius: '10px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000,
            overflow: 'hidden',
            fontFamily: 'sans-serif'
        },
        header: {
            padding: '12px 15px',
            backgroundColor: '#f8f9fa',
            borderBottom: '1px solid #e0e0e0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontWeight: 'bold',
            fontSize: '14px',
            color: '#333'
        },
        closeBtn: {
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            color: '#666',
            lineHeight: 1
        },
        messagesArea: {
            flexGrow: 1,
            overflowY: 'auto',
            padding: '15px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            backgroundColor: '#f4f5f7'
        },
        systemMessage: {
            textAlign: 'center',
            marginBottom: '5px'
        },
        userMessage: {
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#fff',
            padding: '8px 12px',
            borderRadius: '8px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
        },
        msgMeta: {
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '4px'
        },
        username: {
            fontSize: '12px',
            color: '#007bff'
        },
        time: {
            fontSize: '10px',
            color: '#aaa'
        },
        text: {
            fontSize: '13px',
            color: '#333',
            wordBreak: 'break-word'
        },
        form: {
            display: 'flex',
            borderTop: '1px solid #e0e0e0',
            padding: '10px',
            backgroundColor: '#fff'
        },
        input: {
            flexGrow: 1,
            border: '1px solid #ddd',
            borderRadius: '20px',
            padding: '8px 15px',
            outline: 'none',
            fontSize: '13px'
        },
        sendBtn: {
            background: 'none',
            border: 'none',
            marginLeft: '10px',
            fontSize: '20px',
            cursor: 'pointer',
            color: '#007bff'
        }
    };

    if (!isOpen) {
        return (
            <div style={styles.closedContainer}>
                <button style={styles.openBtn} onClick={() => setIsOpen(true)}>
                    💬 Чат
                </button>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <span>Чат комнаты</span>
                <button style={styles.closeBtn} onClick={() => setIsOpen(false)}>×</button>
            </div>

            <div style={styles.messagesArea}>
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        style={msg.system ? styles.systemMessage : styles.userMessage}
                    >
                        {msg.system ? (
                            <i style={{ color: '#888', fontSize: '12px' }}>{msg.text}</i>
                        ) : (
                            <>
                                <div style={styles.msgMeta}>
                                    <b style={styles.username}>{msg.username}</b>
                                    <span style={styles.time}>{msg.time}</span>
                                </div>
                                <div style={styles.text}>{msg.text}</div>
                            </>
                        )}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} style={styles.form}>
                <input
                    style={styles.input}
                    type="text"
                    placeholder="Написать сообщение..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
                <button type="submit" style={styles.sendBtn}>➤</button>
            </form>
        </div>
    );
};

export default Chat;