'use client';

import { useState } from 'react';
import styles from './OfferModal.module.css';

interface OfferModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (amount: number) => Promise<void>;
    currentPrice: number;
    listingTitle: string;
    listingImage: string;
}

export default function OfferModal({ isOpen, onClose, onSubmit, currentPrice, listingTitle, listingImage }: OfferModalProps) {
    const [amount, setAmount] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const offerAmount = parseFloat(amount);

        if (isNaN(offerAmount) || offerAmount <= 0) {
            setError('Please enter a valid amount');
            setLoading(false);
            return;
        }

        if (offerAmount >= currentPrice) {
            setError('Offer must be lower than the current price');
            setLoading(false);
            return;
        }

        if (offerAmount < currentPrice * 0.5) {
            setError('Offer is too low (minimum 50% of price)');
            setLoading(false);
            return;
        }

        try {
            await onSubmit(offerAmount);
            onClose();
        } catch (err) {
            setError('Failed to send offer. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <button className={styles.closeBtn} onClick={onClose}>×</button>

                <h2 className={styles.title}>Make an Offer</h2>

                <div className={styles.itemPreview}>
                    <img src={listingImage} alt={listingTitle} className={styles.itemImage} />
                    <div className={styles.itemInfo}>
                        <div className={styles.itemTitle}>{listingTitle}</div>
                        <div className={styles.currentPrice}>Current Price: {currentPrice} MAD</div>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className={styles.inputGroup}>
                        <span className={styles.currency}>MAD</span>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Enter your offer"
                            className={styles.input}
                            autoFocus
                        />
                    </div>

                    {error && <div className={styles.error}>{error}</div>}

                    <div className={styles.actions}>
                        <button type="button" className={styles.cancelBtn} onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className={styles.submitBtn} disabled={loading || !amount}>
                            {loading ? 'Sending...' : 'Send Offer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
