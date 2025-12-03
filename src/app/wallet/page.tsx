'use client';

import React, { useState, useEffect } from 'react';

export default function WalletPage() {
    const [wallet, setWallet] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState('BANK_TRANSFER');
    const [details, setDetails] = useState({ rib: '', name: '', phone: '' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchWallet();
    }, []);

    const fetchWallet = async () => {
        try {
            const res = await fetch('/api/wallet');
            const data = await res.json();
            setWallet(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleWithdraw = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || parseFloat(amount) <= 0) return alert('Invalid amount');
        if (parseFloat(amount) > (wallet?.balance || 0)) return alert('Insufficient funds');

        setSubmitting(true);
        try {
            const res = await fetch('/api/wallet', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: parseFloat(amount),
                    method,
                    details
                })
            });

            if (res.ok) {
                alert('Withdrawal request submitted!');
                setAmount('');
                fetchWallet();
            } else {
                const err = await res.json();
                alert(err.error || 'Error submitting request');
            }
        } catch (error) {
            console.error(error);
            alert('Error submitting request');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading wallet...</div>;

    return (
        <div style={{ maxWidth: 800, margin: '40px auto', padding: 20 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 30 }}>My Wallet</h1>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 40 }}>
                <div style={{ background: '#0f172a', color: 'white', padding: 30, borderRadius: 16 }}>
                    <div style={{ fontSize: 14, opacity: 0.8, marginBottom: 8 }}>Available Balance</div>
                    <div style={{ fontSize: 36, fontWeight: 700 }}>{wallet?.balance?.toFixed(2) || '0.00'} MAD</div>
                </div>
                <div style={{ background: 'white', border: '1px solid #e2e8f0', padding: 30, borderRadius: 16 }}>
                    <div style={{ fontSize: 14, color: '#64748b', marginBottom: 8 }}>Pending Clearance</div>
                    <div style={{ fontSize: 36, fontWeight: 700, color: '#64748b' }}>{wallet?.pending?.toFixed(2) || '0.00'} MAD</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 40 }}>
                <div>
                    <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>Withdraw Funds</h2>
                    <form onSubmit={handleWithdraw} style={{ background: 'white', padding: 24, borderRadius: 12, border: '1px solid #e2e8f0' }}>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Amount (MAD)</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #cbd5e1' }}
                                placeholder="0.00"
                            />
                        </div>

                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Payout Method</label>
                            <select
                                value={method}
                                onChange={(e) => setMethod(e.target.value)}
                                style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #cbd5e1' }}
                            >
                                <option value="BANK_TRANSFER">Bank Transfer</option>
                                <option value="CASH_PLUS">Cash Plus</option>
                            </select>
                        </div>

                        {method === 'BANK_TRANSFER' ? (
                            <div style={{ marginBottom: 20 }}>
                                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>RIB (24 digits)</label>
                                <input
                                    type="text"
                                    value={details.rib}
                                    onChange={(e) => setDetails({ ...details, rib: e.target.value })}
                                    style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #cbd5e1' }}
                                    placeholder="MA..."
                                />
                            </div>
                        ) : (
                            <div style={{ marginBottom: 20 }}>
                                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Full Name</label>
                                <input
                                    type="text"
                                    value={details.name}
                                    onChange={(e) => setDetails({ ...details, name: e.target.value })}
                                    style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #cbd5e1', marginBottom: 12 }}
                                    placeholder="Name on ID"
                                />
                                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Phone Number</label>
                                <input
                                    type="text"
                                    value={details.phone}
                                    onChange={(e) => setDetails({ ...details, phone: e.target.value })}
                                    style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #cbd5e1' }}
                                    placeholder="06..."
                                />
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={submitting}
                            style={{
                                width: '100%',
                                padding: 14,
                                background: '#0f172a',
                                color: 'white',
                                border: 'none',
                                borderRadius: 8,
                                fontWeight: 600,
                                cursor: 'pointer',
                                opacity: submitting ? 0.7 : 1
                            }}
                        >
                            {submitting ? 'Processing...' : 'Request Payout'}
                        </button>
                    </form>
                </div>

                <div>
                    <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>History</h2>
                    <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                        {wallet?.payouts?.length === 0 ? (
                            <div style={{ padding: 20, color: '#94a3b8', textAlign: 'center' }}>No payouts yet</div>
                        ) : (
                            wallet?.payouts?.map((payout: any) => (
                                <div key={payout.id} style={{ padding: 16, borderBottom: '1px solid #f1f5f9' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <span style={{ fontWeight: 600 }}>{payout.amount} MAD</span>
                                        <span style={{
                                            fontSize: 12,
                                            padding: '2px 8px',
                                            borderRadius: 10,
                                            background: payout.status === 'PENDING' ? '#fff7ed' : '#f0fdf4',
                                            color: payout.status === 'PENDING' ? '#c2410c' : '#15803d'
                                        }}>
                                            {payout.status}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: 12, color: '#64748b' }}>
                                        {new Date(payout.createdAt).toLocaleDateString()} • {payout.method.replace('_', ' ')}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
