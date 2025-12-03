'use client';

import React, { useState, useEffect } from 'react';

export default function AdminPayoutsPage() {
    const [payouts, setPayouts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPayouts();
    }, []);

    const fetchPayouts = async () => {
        const res = await fetch('/api/admin/payouts');
        if (res.ok) {
            setPayouts(await res.json());
        }
        setLoading(false);
    };

    const handleAction = async (id: string, action: 'APPROVE' | 'REJECT') => {
        if (!confirm(`Are you sure you want to ${action} this payout?`)) return;

        const res = await fetch('/api/admin/payouts', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, action })
        });

        if (res.ok) {
            fetchPayouts();
        } else {
            alert('Error processing payout');
        }
    };

    if (loading) return <div style={{ padding: 40 }}>Loading...</div>;

    return (
        <div style={{ padding: 40 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 30 }}>Payout Requests</h1>

            <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
                            <th style={{ padding: 16 }}>User</th>
                            <th style={{ padding: 16 }}>Amount</th>
                            <th style={{ padding: 16 }}>Method</th>
                            <th style={{ padding: 16 }}>Details</th>
                            <th style={{ padding: 16 }}>Status</th>
                            <th style={{ padding: 16 }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payouts.map(payout => (
                            <tr key={payout.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                                <td style={{ padding: 16 }}>
                                    <div style={{ fontWeight: 600 }}>{payout.wallet.user.name}</div>
                                    <div style={{ fontSize: 12, color: '#64748b' }}>{payout.wallet.user.email}</div>
                                </td>
                                <td style={{ padding: 16, fontWeight: 700 }}>{payout.amount} MAD</td>
                                <td style={{ padding: 16 }}>{payout.method.replace('_', ' ')}</td>
                                <td style={{ padding: 16, fontSize: 13, maxWidth: 200 }}>
                                    <pre style={{ margin: 0, fontFamily: 'inherit' }}>{JSON.stringify(payout.details, null, 2)}</pre>
                                </td>
                                <td style={{ padding: 16 }}>
                                    <span style={{
                                        padding: '4px 10px',
                                        borderRadius: 20,
                                        fontSize: 12,
                                        fontWeight: 600,
                                        background: payout.status === 'PENDING' ? '#fff7ed' : payout.status === 'PROCESSED' ? '#f0fdf4' : '#fef2f2',
                                        color: payout.status === 'PENDING' ? '#c2410c' : payout.status === 'PROCESSED' ? '#15803d' : '#b91c1c'
                                    }}>
                                        {payout.status}
                                    </span>
                                </td>
                                <td style={{ padding: 16 }}>
                                    {payout.status === 'PENDING' && (
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button
                                                onClick={() => handleAction(payout.id, 'APPROVE')}
                                                style={{ padding: '6px 12px', background: '#22c55e', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleAction(payout.id, 'REJECT')}
                                                style={{ padding: '6px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {payouts.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>No payout requests found.</div>}
            </div>
        </div>
    );
}
