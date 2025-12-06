'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/useToast';
import styles from './admin.module.css';

export default function AdminDisputesPage() {
    const [disputes, setDisputes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const toast = useToast();

    useEffect(() => {
        fetchDisputes();
    }, []);

    const fetchDisputes = async () => {
        try {
            const res = await fetch('/api/admin/disputes');
            if (res.ok) {
                setDisputes(await res.json());
            } else {
                toast.error('Failed to load disputes');
            }
        } catch (error) {
            toast.error('Error loading disputes');
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async (id: string, resolution: 'REFUND_BUYER' | 'RELEASE_SELLER') => {
        const msg = resolution === 'REFUND_BUYER' ?
            'Are you sure you want to refund the buyer? This cannot be undone.' :
            'Are you sure you want to release funds to the seller? This cannot be undone.';

        if (!confirm(msg)) return;

        setProcessingId(id);
        try {
            const res = await fetch('/api/admin/disputes', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, resolution })
            });

            if (res.ok) {
                toast.success(resolution === 'REFUND_BUYER' ? 'Buyer refunded successfully' : 'Funds released to seller');
                fetchDisputes();
            } else {
                toast.error('Failed to resolve dispute');
            }
        } catch (error) {
            toast.error('Error resolving dispute');
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1>Dispute Resolution</h1>
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
                <h1>Dispute Resolution</h1>
                <div className={styles.stats}>
                    <div className={styles.statBadge}>
                        <span className={styles.statValue}>{disputes.filter(d => d.status === 'OPEN').length}</span>
                        <span className={styles.statLabel}>Open</span>
                    </div>
                    <div className={styles.statBadge}>
                        <span className={styles.statValue}>{disputes.filter(d => d.status === 'RESOLVED').length}</span>
                        <span className={styles.statLabel}>Resolved</span>
                    </div>
                </div>
            </div>

            {disputes.length === 0 ? (
                <div className={styles.emptyState}>
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3>No disputes found</h3>
                    <p>All clear! There are no active disputes to resolve.</p>
                </div>
            ) : (
                <div className={styles.tableCard}>
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Transaction</th>
                                    <th>Reason</th>
                                    <th>Description</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {disputes.map(dispute => (
                                    <tr key={dispute.id}>
                                        <td>
                                            <div className={styles.transactionInfo}>
                                                <div className={styles.itemTitle}>{dispute.transaction.listing.title}</div>
                                                <div className={styles.parties}>
                                                    <span>👤 Buyer: {dispute.transaction.buyer.name}</span>
                                                    <span>🏪 Seller: {dispute.transaction.seller.name}</span>
                                                </div>
                                                <div className={styles.amount}>{dispute.transaction.amount} MAD</div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={styles.reason}>{dispute.reason}</span>
                                        </td>
                                        <td>
                                            <div className={styles.description}>{dispute.description}</div>
                                        </td>
                                        <td>
                                            <span className={`${styles.badge} ${styles[dispute.status.toLowerCase()]}`}>
                                                {dispute.status}
                                            </span>
                                        </td>
                                        <td>
                                            {dispute.status === 'OPEN' && (
                                                <div className={styles.actions}>
                                                    <button
                                                        onClick={() => handleResolve(dispute.id, 'REFUND_BUYER')}
                                                        disabled={processingId === dispute.id}
                                                        className={`${styles.btn} ${styles.btnDanger}`}
                                                    >
                                                        {processingId === dispute.id ? '...' : '💰 Refund Buyer'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleResolve(dispute.id, 'RELEASE_SELLER')}
                                                        disabled={processingId === dispute.id}
                                                        className={`${styles.btn} ${styles.btnSuccess}`}
                                                    >
                                                        {processingId === dispute.id ? '...' : '✓ Release to Seller'}
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
