'use client';

import { useState } from 'react';
import { createDispute } from '@/app/actions/dispute';
import styles from './ReportModal.module.css'; // Reusing ReportModal styles

interface DisputeModalProps {
    transactionId: string;
    itemTitle: string;
    onClose: () => void;
}

const DISPUTE_REASONS = [
    'Item not received',
    'Item not as described',
    'Item arrived damaged',
    'Wrong item sent',
    'Other'
];

export default function DisputeModal({ transactionId, itemTitle, onClose }: DisputeModalProps) {
    const [reason, setReason] = useState('');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reason) return;

        setSubmitting(true);

        const result = await createDispute(transactionId, reason, description);

        if (result.success) {
            setSubmitted(true);
            setTimeout(() => onClose(), 2000);
        } else {
            alert(result.error || 'Failed to submit dispute');
        }

        setSubmitting(false);
    };

    if (submitted) {
        return (
            <div className={styles.overlay} onClick={onClose}>
                <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                    <div className={styles.success}>
                        <div className={styles.successIcon}>✓</div>
                        <h3>Dispute Submitted</h3>
                        <p>We have received your dispute and will review it shortly.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2>Report Issue</h2>
                    <button onClick={onClose} className={styles.closeBtn}>×</button>
                </div>

                <div className={styles.target}>
                    Item: <strong>{itemTitle}</strong>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.field}>
                        <label>Reason *</label>
                        <select
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            required
                            className={styles.select}
                        >
                            <option value="">Select a reason</option>
                            {DISPUTE_REASONS.map(r => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.field}>
                        <label>Description *</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Please describe the issue in detail..."
                            className={styles.textarea}
                            rows={4}
                            required
                        />
                    </div>

                    <div className={styles.actions}>
                        <button type="button" onClick={onClose} className={styles.cancelBtn}>
                            Cancel
                        </button>
                        <button type="submit" disabled={submitting || !reason || !description} className={styles.submitBtn}>
                            {submitting ? 'Submitting...' : 'Submit Dispute'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
