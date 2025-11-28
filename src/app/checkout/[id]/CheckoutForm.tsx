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
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    listingId: listing.id,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Payment initiation failed');
            }

            if (data.url) {
                // Redirect to Stripe Checkout
                window.location.href = data.url;
            } else {
                throw new Error('No checkout URL received');
            }
        } catch (err: any) {
            console.error('Payment Error:', err);
            setError(err.message || 'Payment failed');
            setLoading(false);
        }
    };

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

            <div className={styles.paymentSection}>
                <h2 className={styles.formTitle}>Payment Method 💳</h2>
                <p className={styles.secureText}>
                    You will be redirected to Stripe to complete your payment securely.
                </p>

                <button
                    onClick={handleSubmit}
                    className={styles.payButton}
                    disabled={loading}
                >
                    {loading ? 'Redirecting to Stripe...' : `Pay ${TOTAL.toFixed(2)} MAD`}
                </button>

                {error && <div className={styles.error}>{error}</div>}
            </div>
        </div>
    );
}
