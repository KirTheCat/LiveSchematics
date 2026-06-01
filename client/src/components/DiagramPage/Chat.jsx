import React, { useState, useEffect, useRef } from 'react';
import { socket } from '../../hooks/useDiagram/useSync';
import styles from './Chat.module.css';
import '../../App.css';

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

    if (!isOpen) {
        return (
            <div className={styles.closedContainer}>
                <button className={styles.openBtn} onClick={() => setIsOpen(true)}>
                    💬 Чат
                </button>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <span>Чат комнаты</span>
                <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>×</button>
            </div>

            <div className={styles.messagesArea}>
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={msg.system ? styles.systemMessage : styles.userMessage}
                    >
                        {msg.system ? (
                            <i className={styles.systemText}>{msg.text}</i>
                        ) : (
                            <>
                                <div className={styles.msgMeta}>
                                    <b className={styles.username}>{msg.username}</b>
                                    <span className={styles.time}>{msg.time}</span>
                                </div>
                                <div className={styles.text}>{msg.text}</div>
                            </>
                        )}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} className={styles.form}>
                <input
                    className={styles.input}
                    type="text"
                    placeholder="Написать сообщение..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
                <button type="submit" className={styles.sendBtn}>➤</button>
            </form>
        </div>
    );
};

export default Chat;