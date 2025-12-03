'use client';

import React, { useState, useEffect } from 'react';

export default function AdminDisputesPage() {
    const [disputes, setDisputes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDisputes();
    }, []);

    const fetchDisputes = async () => {
        const res = await fetch('/api/admin/disputes');
        if (res.ok) {
            setDisputes(await res.json());
        }
        setLoading(false);
    };

    const handleResolve = async (id: string, resolution: 'REFUND_BUYER' | 'RELEASE_SELLER') => {
        const msg = resolution === 'REFUND_BUYER' ? 'Refund the Buyer?' : 'Release funds to Seller?';
        if (!confirm(msg)) return;

        const res = await fetch('/api/admin/disputes', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, resolution })
        });

        if (res.ok) {
            fetchDisputes();
        } else {
            alert('Error resolving dispute');
        }
    };

    if (loading) return <div style={{ padding: 40 }}>Loading...</div>;

    return (
        <div style={{ padding: 40 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 30 }}>Dispute Resolution</h1>

            <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
                            <th style={{ padding: 16 }}>Transaction</th>
                            <th style={{ padding: 16 }}>Reason</th>
                            <th style={{ padding: 16 }}>Description</th>
                            <th style={{ padding: 16 }}>Status</th>
                            <th style={{ padding: 16 }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {disputes.map(dispute => (
                            <tr key={dispute.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                                <td style={{ padding: 16 }}>
                                    <div style={{ fontWeight: 600 }}>{dispute.transaction.listing.title}</div>
                                    <div style={{ fontSize: 12, color: '#64748b' }}>
                                        Buyer: {dispute.transaction.buyer.name}<br />
                                        Seller: {dispute.transaction.seller.name}
                                    </div>
                                    <div style={{ fontSize: 12, fontWeight: 700, marginTop: 4 }}>
                                        {dispute.transaction.amount} MAD
                                    </div>
                                </td>
                                <td style={{ padding: 16, fontWeight: 600 }}>{dispute.reason}</td>
                                <td style={{ padding: 16, fontSize: 13, maxWidth: 300 }}>{dispute.description}</td>
                                <td style={{ padding: 16 }}>
                                    <span style={{
                                        padding: '4px 10px',
                                        borderRadius: 20,
                                        fontSize: 12,
                                        fontWeight: 600,
                                        background: dispute.status === 'OPEN' ? '#fef2f2' : '#f0fdf4',
                                        color: dispute.status === 'OPEN' ? '#b91c1c' : '#15803d'
                                    }}>
                                        {dispute.status}
                                    </span>
                                </td>
                                <td style={{ padding: 16 }}>
                                    {dispute.status === 'OPEN' && (
                                        <div style={{ display: 'flex', gap: 8, flexDirection: 'column' }}>
                                            <button
                                                onClick={() => handleResolve(dispute.id, 'REFUND_BUYER')}
                                                style={{ padding: '6px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}
                                            >
                                                Refund Buyer
                                            </button>
                                            <button
                                                onClick={() => handleResolve(dispute.id, 'RELEASE_SELLER')}
                                                style={{ padding: '6px 12px', background: '#22c55e', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}
                                            >
                                                Release to Seller
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {disputes.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>No disputes found.</div>}
            </div>
        </div>
    );
}
