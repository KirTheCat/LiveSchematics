// src/components/Modals/LeaveRoomModal.jsx
import React from 'react';
import styles from '../../pages/DiagramPage.module.css';

const LeaveRoomModal = ({ isOpen, isLastUser, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modal}>
                <h3>Выход из комнаты</h3>
                {isLastUser ? (
                    <>
                        <p>Вы последний участник. Комната будет удалена.</p>
                        <p>Сохранить схему?</p>
                        <div className={styles.modalButtons}>
                            <button className={styles.btnSecondary} onClick={onClose}>
                                Отмена
                            </button>
                            <button className={styles.btnDanger} onClick={() => onConfirm(false)}>
                                Выйти без сохранения
                            </button>
                            <button className={styles.btnSuccess} onClick={() => onConfirm(true)}>
                                Сохранить и выйти
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <p>Выйти из комнаты?</p>
                        <div className={styles.modalButtons}>
                            <button className={styles.btnSecondary} onClick={onClose}>
                                Отмена
                            </button>
                            <button className={styles.btnDanger} onClick={() => onConfirm(false)}>
                                Выйти
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default LeaveRoomModal;