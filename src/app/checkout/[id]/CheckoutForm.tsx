'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { processPayment } from '@/app/actions/transaction';
import styles from './checkout.module.css';

interface CheckoutFormProps {
    listing: {
        id: string;
        title: string;
        price: number;
        images: string;
        brand: string | null;
        size: string | null;
    };
    effectivePrice?: number;
    isOfferPrice?: boolean;
}

export default function CheckoutForm({ listing, effectivePrice, isOfferPrice }: CheckoutFormProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    let images = [];
    try {
        images = JSON.parse(listing.images);
    } catch (e) {
        images = [];
    }
    const firstImage = images[0] || '';

    // Fees
    const price = effectivePrice || listing.price;
    const SHIPPING = 4.99;
    const PROTECTION_FEE = price * 0.05; // 5% Buyer Protection
    const TOTAL = price + SHIPPING + PROTECTION_FEE;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Mock card data - in real app would come from Stripe Elements
            const cardDetails = { token: 'tok_visa' };
            const result = await processPayment(listing.id, cardDetails);

            setSuccess(true);
            setTimeout(() => {
                router.push('/purchases'); // Redirect to purchases page
            }, 3000);
        } catch (err: any) {
            setError(err.message || 'Payment failed');
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className={styles.container}>
                <div className={styles.success}>
                    <span className={styles.successIcon}>🎉</span>
                    <h2 className={styles.title}>Order Confirmed!</h2>
                    <p>Your payment was successful.</p>
                    <p>Redirecting you...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Checkout</h1>
            </header>

            <div className={styles.summary}>
                <div className={styles.itemRow}>
                    <img src={firstImage} alt={listing.title} className={styles.itemImage} />
                    <div className={styles.itemDetails}>
                        <h3>{listing.title}</h3>
                        <p>{listing.brand} • {listing.size}</p>
                    </div>
                </div>

                <div className={styles.priceBreakdown}>
                    <div className={styles.row}>
                        <span>
                            Item Price
                            {isOfferPrice && <span className={styles.offerBadge}>Offer Applied</span>}
                        </span>
                        <span>{price.toFixed(2)} MAD</span>
                    </div>
                    <div className={styles.row}>
                        <span>Shipping</span>
                        <span>{SHIPPING.toFixed(2)} MAD</span>
                    </div>
                    <div className={styles.row}>
                        <span>Buyer Protection (5%)</span>
                        <span>{PROTECTION_FEE.toFixed(2)} MAD</span>
                    </div>
                    <div className={styles.totalRow}>
                        <span>Total</span>
                        <span>{TOTAL.toFixed(2)} MAD</span>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
                <h2 className={styles.formTitle}>Payment Details 💳</h2>

                <div className={styles.inputGroup}>
                    <label className={styles.label}>Card Number</label>
                    <input type="text" className={styles.input} placeholder="4242 4242 4242 4242" defaultValue="4242 4242 4242 4242" />
                </div>

                <div className={styles.row2}>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Expiry</label>
                        <input type="text" className={styles.input} placeholder="MM/YY" defaultValue="12/25" />
                    </div>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>CVC</label>
                        <input type="text" className={styles.input} placeholder="123" defaultValue="123" />
                    </div>
                </div>

                <button type="submit" className={styles.payButton} disabled={loading}>
                    {loading ? 'Processing...' : `Pay ${TOTAL.toFixed(2)} MAD`}
                </button>

                {error && <div className={styles.error}>{error}</div>}
            </form>
        </div>
    );
}
