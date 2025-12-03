'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { markAsDelivered, disputeTransaction } from '@/app/actions/fulfillment';

interface BuyerProtectionActionsProps {
    transactionId: string;
}

export default function BuyerProtectionActions({ transactionId }: BuyerProtectionActionsProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showDisputeForm, setShowDisputeForm] = useState(false);
    const [disputeReason, setDisputeReason] = useState('');
    const [orderCompleted, setOrderCompleted] = useState(false);

    const handleComplete = async () => {
        if (!confirm('Are you sure everything is okay? This will release funds to the seller.')) return;

        setLoading(true);
        try {
            await markAsDelivered(transactionId);
            setOrderCompleted(true);
        } catch (e) {
            console.error(e);
            alert('Error completing order');
        } finally {
            setLoading(false);
        }
    };

    const handleDispute = async () => {
        if (!disputeReason) return alert('Please provide a reason');

        setLoading(true);
        try {
            await disputeTransaction(transactionId, disputeReason);
            alert('Issue reported. The transaction has been suspended.');
        } catch (e) {
            console.error(e);
            alert('Error reporting issue');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ marginTop: 30, padding: 20, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 10, color: '#0f172a' }}>Buyer Protection</h3>
            <p style={{ fontSize: 14, color: '#64748b', marginBottom: 20 }}>
                Please confirm if you have received the item and it matches the description.
            </p>

            {!showDisputeForm ? (
                <div style={{ display: 'flex', gap: 12 }}>
                    <button
                        onClick={handleComplete}
                        disabled={loading}
                        style={{
                            flex: 1,
                            padding: '10px 20px',
                            background: '#22c55e',
                            color: 'white',
                            border: 'none',
                            borderRadius: 8,
                            fontWeight: 600,
                            cursor: 'pointer',
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        ✅ Everything is OK
                    </button>
                    <button
                        onClick={() => setShowDisputeForm(true)}
                        disabled={loading}
                        style={{
                            flex: 1,
                            padding: '10px 20px',
                            background: 'white',
                            color: '#ef4444',
                            border: '1px solid #ef4444',
                            borderRadius: 8,
                            fontWeight: 600,
                            cursor: 'pointer',
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        ⚠️ I have an issue
                    </button>
                </div>
            ) : (
                <div>
                    <textarea
                        value={disputeReason}
                        onChange={(e) => setDisputeReason(e.target.value)}
                        placeholder="Describe the issue (e.g., item damaged, wrong item)..."
                        style={{
                            width: '100%',
                            padding: 12,
                            borderRadius: 8,
                            border: '1px solid #cbd5e1',
                            marginBottom: 12,
                            minHeight: 80
                        }}
                    />
                    <div style={{ display: 'flex', gap: 12 }}>
                        <button
                            onClick={handleDispute}
                            disabled={loading}
                            style={{
                                flex: 1,
                                padding: '10px 20px',
                                background: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: 8,
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        >
                            Submit Issue
                        </button>
                        <button
                            onClick={() => setShowDisputeForm(false)}
                            disabled={loading}
                            style={{
                                padding: '10px 20px',
                                background: 'transparent',
                                color: '#64748b',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
