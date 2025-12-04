'use client';

import { useEffect, useState } from 'react';
import styles from './toast.module.css';
import { Toast as ToastType } from './ToastProvider';

interface ToastProps {
    toast: ToastType;
    onClose: () => void;
}

export default function Toast({ toast, onClose }: ToastProps) {
    const [isExiting, setIsExiting] = useState(false);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(onClose, 300); // Wait for animation
    };

    const getIcon = () => {
        switch (toast.type) {
            case 'success':
                return '✓';
            case 'error':
                return '✕';
            case 'warning':
                return '⚠';
            case 'info':
                return 'ℹ';
        }
    };

    return (
        <div
            className={`${styles.toast} ${styles[toast.type]} ${isExiting ? styles.exit : ''}`}
            onClick={handleClose}
        >
            <div className={styles.icon}>{getIcon()}</div>
            <div className={styles.message}>{toast.message}</div>
            <button className={styles.closeBtn} onClick={handleClose}>×</button>
            {toast.duration && toast.duration > 0 && (
                <div className={styles.progress} style={{ animationDuration: `${toast.duration}ms` }} />
            )}
        </div>
    );
}
