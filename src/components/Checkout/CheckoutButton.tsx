'use client';

import { useRouter } from 'next/navigation';

interface CheckoutButtonProps {
    listingId: string;
    price: number;
    listingStatus?: string;
    className?: string;
    children?: React.ReactNode;
}

export default function CheckoutButton({ listingId, price, listingStatus, className, children }: CheckoutButtonProps) {
    const router = useRouter();

    const handleCheckout = () => {
        // Check if item is sold before trying to checkout
        if (listingStatus === 'SOLD') {
            alert('This item has been sold and is no longer available.');
            return;
        }

        // Redirect to checkout page instead of going directly to Stripe
        router.push(`/checkout/${listingId}`);
    };

    return (
        <button
            onClick={handleCheckout}
            disabled={listingStatus === 'SOLD'}
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
                cursor: listingStatus === 'SOLD' ? 'not-allowed' : 'pointer',
                opacity: listingStatus === 'SOLD' ? 0.7 : 1,
                marginTop: '16px',
            } : undefined}
        >
            {listingStatus === 'SOLD' ? 'Sold Out' : (children || `Buy Now • ${price} MAD`)}
        </button>
    );
}
