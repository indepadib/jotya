'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { markAsDelivered, disputeTransaction } from '@/app/actions/fulfillment';
import { useToast } from '@/hooks/useToast';

interface BuyerProtectionActionsProps {
    transactionId: string;
}

export default function BuyerProtectionActions({ transactionId }: BuyerProtectionActionsProps) {
    const router = useRouter();
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [showDispute, setShowDispute] = useState(false);
    const [disputeReason, setDisputeReason] = useState('');
    const [orderCompleted, setOrderCompleted] = useState(false);

    const handleComplete = async () => {
        setLoading(true);

        try {
            await markAsDelivered(transactionId);
            setOrderCompleted(true);
            toast.success('Order completed! Funds released to seller.');
        } catch (e) {
            console.error(e);
            toast.error('Error completing order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDispute = async () => {
        if (!disputeReason.trim()) {
            toast.warning('Please describe the issue before submitting.');
            return;
        }

        setLoading(true);
        try {
            await disputeTransaction(transactionId, disputeReason);
            toast.success('Issue reported. The transaction has been suspended.');
            router.refresh();
        } catch (e) {
            console.error(e);
            toast.error('Error reporting issue. Please try again.');
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

            {!showDispute ? (
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
                        onClick={() => setShowDispute(true)}
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
                            onClick={() => setShowDispute(false)}
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
