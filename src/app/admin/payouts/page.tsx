'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/useToast';
import styles from '../admin.module.css';

export default function AdminPayoutsPage() {
    const [payouts, setPayouts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const toast = useToast();

    useEffect(() => {
        fetchPayouts();
    }, []);

    const fetchPayouts = async () => {
        try {
            const res = await fetch('/api/admin/payouts');
            if (res.ok) {
                setPayouts(await res.json());
            } else {
                toast.error('Failed to load payouts');
            }
        } catch (error) {
            toast.error('Error loading payouts');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id: string, action: 'APPROVE' | 'REJECT') => {
        if (!confirm(`Are you sure you want to ${action.toLowerCase()} this payout?`)) return;

        setProcessingId(id);
        try {
            const res = await fetch('/api/admin/payouts', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, action })
            });

            if (res.ok) {
                toast.success(`Payout ${action.toLowerCase()}d successfully`);
                fetchPayouts();
            } else {
                toast.error('Failed to process payout');
            }
        } catch (error) {
            toast.error('Error processing payout');
        } finally {
            setProcessingId(null);
        }
    };

    const getTotalPending = () => {
        return payouts
            .filter(p => p.status === 'PENDING')
            .reduce((sum, p) => sum + p.amount, 0);
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1>Payout Requests</h1>
                </div>
                <div className={styles.loadingCard}>
                    <div className="skeleton rectangular" style={{ width: '100%', height: '60px', marginBottom: '20px' }} />
                    <div className="skeleton rectangular" style={{ width: '100%', height: '60px', marginBottom: '20px' }} />
                    <div className="skeleton rectangular" style={{ width: '100%', height: '60px' }} />
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Payout Requests</h1>
                <div className={styles.stats}>
                    <div className={styles.statBadge}>
                        <span className={styles.statValue}>{payouts.filter(p => p.status === 'PENDING').length}</span>
                        <span className={styles.statLabel}>Pending</span>
                    </div>
                    <div className={styles.statBadge}>
                        <span className={styles.statValue}>{getTotalPending().toLocaleString()} MAD</span>
                        <span className={styles.statLabel}>Total Amount</span>
                    </div>
                </div>
            </div>

            {payouts.length === 0 ? (
                <div className={styles.emptyState}>
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    <h3>No payout requests</h3>
                    <p>There are no pending payout requests at this time.</p>
                </div>
            ) : (
                <div className={styles.tableCard}>
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Amount</th>
                                    <th>Method</th>
                                    <th>Details</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payouts.map(payout => (
                                    <tr key={payout.id}>
                                        <td>
                                            <div className={styles.userInfo}>
                                                <div className={styles.userName}>{payout.wallet.user.name}</div>
                                                <div className={styles.userEmail}>{payout.wallet.user.email}</div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={styles.amount}>{payout.amount.toLocaleString()} MAD</span>
                                        </td>
                                        <td>
                                            <span className={styles.method}>{payout.method.replace('_', ' ')}</span>
                                        </td>
                                        <td>
                                            <details className={styles.details}>
                                                <summary>View Details</summary>
                                                <pre>{JSON.stringify(payout.details, null, 2)}</pre>
                                            </details>
                                        </td>
                                        <td>
                                            <span className={`${styles.badge} ${styles[payout.status.toLowerCase()]}`}>
                                                {payout.status}
                                            </span>
                                        </td>
                                        <td>
                                            {payout.status === 'PENDING' && (
                                                <div className={styles.actions}>
                                                    <button
                                                        onClick={() => handleAction(payout.id, 'APPROVE')}
                                                        disabled={processingId === payout.id}
                                                        className={`${styles.btn} ${styles.btnSuccess}`}
                                                    >
                                                        {processingId === payout.id ? '...' : '✓ Approve'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction(payout.id, 'REJECT')}
                                                        disabled={processingId === payout.id}
                                                        className={`${styles.btn} ${styles.btnDanger}`}
                                                    >
                                                        {processingId === payout.id ? '...' : '✕ Reject'}
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
