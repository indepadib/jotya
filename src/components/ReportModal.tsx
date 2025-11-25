'use client';

import { useState } from 'react';
import { reportUser, reportListing } from '@/app/actions/report';
import styles from './ReportModal.module.css';

interface ReportModalProps {
    type: 'user' | 'listing';
    targetId: string;
    targetName: string;
    onClose: () => void;
}

const REPORT_REASONS = {
    user: [
        'Scam or fraud',
        'Fake or misleading profile',
        'Harassment or abusive behavior',
        'Spam',
        'Other'
    ],
    listing: [
        'Counterfeit or fake item',
        'Misleading description',
        'Inappropriate content',
        'Prohibited item',
        'Price gouging',
        'Other'
    ]
};

export default function ReportModal({ type, targetId, targetName, onClose }: ReportModalProps) {
    const [reason, setReason] = useState('');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reason) return;

        setSubmitting(true);

        const result = type === 'user'
            ? await reportUser(targetId, reason, description)
            : await reportListing(targetId, reason, description);

        if (result.success) {
            setSubmitted(true);
            setTimeout(() => onClose(), 2000);
        } else {
            alert(result.error || 'Failed to submit report');
        }

        setSubmitting(false);
    };

    if (submitted) {
        return (
            <div className={styles.overlay} onClick={onClose}>
                <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                    <div className={styles.success}>
                        <div className={styles.successIcon}>✓</div>
                        <h3>Report Submitted</h3>
                        <p>Thank you for helping keep Jotya safe. We'll review this report shortly.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2>Report {type === 'user' ? 'User' : 'Listing'}</h2>
                    <button onClick={onClose} className={styles.closeBtn}>×</button>
                </div>

                <div className={styles.target}>
                    Reporting: <strong>{targetName}</strong>
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
                            {REPORT_REASONS[type].map(r => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.field}>
                        <label>Additional Details (Optional)</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Provide any additional information that might help us review this report..."
                            className={styles.textarea}
                            rows={4}
                        />
                    </div>

                    <div className={styles.actions}>
                        <button type="button" onClick={onClose} className={styles.cancelBtn}>
                            Cancel
                        </button>
                        <button type="submit" disabled={submitting || !reason} className={styles.submitBtn}>
                            {submitting ? 'Submitting...' : 'Submit Report'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
