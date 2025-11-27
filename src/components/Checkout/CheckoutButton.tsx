'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface CheckoutButtonProps {
    listingId: string;
    price: number;
    className?: string;
    children?: React.ReactNode;
}

export default function CheckoutButton({ listingId, price, className, children }: CheckoutButtonProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleCheckout = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ listingId }),
            });

            const data = await response.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                console.error('Checkout error:', data.error);
                alert('Failed to start checkout. Please try again.');
                setLoading(false);
            }
        } catch (error) {
            console.error('Checkout error:', error);
            alert('An error occurred. Please try again.');
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleCheckout}
            disabled={loading}
            className={className}
            style={!className ? {
                width: '100%',
                padding: '16px',
                background: '#000',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                marginTop: '16px',
            } : undefined}
        >
            {loading ? 'Processing...' : (children || `Buy Now • ${price} MAD`)}
        </button>
    );
}
