'use client';

import { useState } from 'react';
import { withdrawFunds } from '@/app/actions/transaction';
import { releaseMockFunds } from '@/app/actions/wallet_test'; // We need to create this for testing
import styles from './wallet.module.css';

interface WalletViewProps {
    wallet: {
        balance: number;
        pending: number;
    };
}

export default function WalletView({ wallet }: WalletViewProps) {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleWithdraw = async () => {
        if (wallet.balance <= 0) return;
        setLoading(true);
        try {
            await withdrawFunds();
            setMessage('Withdrawal successful! Funds sent to bank.');
        } catch (e) {
            setMessage('Withdrawal failed.');
        }
        setLoading(false);
    };

    const handleRelease = async () => {
        if (wallet.pending <= 0) return;
        setLoading(true);
        try {
            await releaseMockFunds();
            setMessage('Funds released! (Simulated delivery)');
        } catch (e) {
            setMessage('Failed to release funds.');
        }
        setLoading(false);
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>My Wallet</h1>
                <p className={styles.subtitle}>Manage your earnings and payouts.</p>
            </header>

            <div className={styles.balanceCard}>
                <div className={styles.balanceLabel}>Available Balance</div>
                <div className={styles.balanceAmount}>{wallet.balance.toFixed(2)} MAD</div>

                <div className={styles.pendingRow}>
                    <span className={styles.pendingLabel}>Pending (Orders in transit)</span>
                    <span className={styles.pendingAmount}>{wallet.pending.toFixed(2)} MAD</span>
                </div>
            </div>

            <div className={styles.actions}>
                <button
                    className={`${styles.btn} ${styles.withdrawBtn}`}
                    onClick={handleWithdraw}
                    disabled={loading || wallet.balance <= 0}
                >
                    Withdraw Funds
                </button>

                {/* Dev Tool for testing */}
                <button
                    className={`${styles.btn} ${styles.releaseBtn}`}
                    onClick={handleRelease}
                    disabled={loading || wallet.pending <= 0}
                >
                    Simulate Delivery (Release)
                </button>
            </div>

            {message && <div style={{ marginBottom: 20, color: '#10b981', textAlign: 'center' }}>{message}</div>}

            <h2 className={styles.historyTitle}>Recent Activity</h2>
            <div className={styles.emptyState}>
                No recent transactions.
            </div>
        </div>
    );
}
