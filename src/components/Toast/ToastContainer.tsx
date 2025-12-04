'use client';

import { useToastContext } from '@/components/Toast/ToastProvider';
import Toast from '@/components/Toast/Toast';
import styles from './toast.module.css';

export default function ToastContainer() {
    const { toasts, removeToast } = useToastContext();

    return (
        <div className={styles.container}>
            {toasts.map((toast) => (
                <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
            ))}
        </div>
    );
}
