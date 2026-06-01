/* src/components/Lobby/RoomList.jsx*/
import React from 'react';
import styles from '../../pages/LobbyPage.module.css';

export const RoomList = ({ rooms, onJoin }) => (
    <div className={styles.listContainer}>
        <div className={styles.listHeader}>
            <h3 className={styles.listTitle}>Активные комнаты</h3>
            <div style={{ width: 32 }} />
        </div>

        <div className={styles.roomList}>
            {rooms.length === 0 ? (
                <div className={styles.emptyState}>
                    <span role="img" aria-label="emoji" style={{ fontSize: '24px' }}>🚫</span>
                    <p>Нет активных комнат. Создайте первую!</p>
                </div>
            ) : (
                rooms.map(room => (
                    <div key={room.roomId} className={styles.roomItem} onClick={() => onJoin(room.roomId)}>
                        <div className={styles.roomInfo}>
                            <div className={styles.roomName}>
                                {room.roomName}
                                {room.hasPassword && <span title="Закрытая комната">🔒</span>}
                            </div>
                            <div className={styles.roomMeta}>
                                <span>{room.userCount} участников</span>
                                {room.hasPassword && <span style={{ color: '#ffc107', marginLeft: 5 }}>• Закрытая</span>}
                            </div>
                        </div>
                        <button className={styles.joinBtn}>Войти</button>
                    </div>
                ))
            )}
        </div>
    </div>
);