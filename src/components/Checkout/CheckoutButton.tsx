'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface CheckoutButtonProps {
    listingId: string;
    price: number;
    listingStatus?: string;
    className?: string;
    children?: React.ReactNode;
}

export default function CheckoutButton({ listingId, price, listingStatus, className, children }: CheckoutButtonProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleCheckout = async () => {
        // Check if item is sold before trying to checkout
        if (listingStatus === 'SOLD') {
            alert('This item has been sold and is no longer available.');
            return;
        }

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
                const errorMsg = data.error || 'Failed to start checkout. Please try again.';
                alert(errorMsg);
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
            disabled={loading || listingStatus === 'SOLD'}
            className={className}
            style={!className ? {
                width: '100%',
                padding: '16px',
                background: listingStatus === 'SOLD' ? '#ccc' : '#000',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: (loading || listingStatus === 'SOLD') ? 'not-allowed' : 'pointer',
                opacity: (loading || listingStatus === 'SOLD') ? 0.7 : 1,
                marginTop: '16px',
            } : undefined}
        >
            {listingStatus === 'SOLD' ? 'Sold Out' : (loading ? 'Processing...' : (children || `Buy Now • ${price} MAD`))}
        </button>
    );
}
