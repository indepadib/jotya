'use client';

import { useRouter } from 'next/navigation';
import styles from './FloatingAIChat.module.css';

interface OfferMessageProps {
    productImage: string;
    productName: string;
    price: number;
    originalPrice?: number;
    status?: 'pending' | 'accepted' | 'rejected';
    productId?: string;
    onAccept?: () => void;
    onDecline?: () => void;
}

export default function OfferMessage({
    productImage,
    productName,
    price,
    originalPrice,
    status = 'pending',
    productId,
    onAccept,
    onDecline
}: OfferMessageProps) {
    const router = useRouter();

    const handleCardClick = () => {
        if (productId) {
            router.push(`/items/${productId}`);
        }
    };

    return (
        <div
            className={styles.offerCard}
            onClick={handleCardClick}
            style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                overflow: 'hidden',
                marginTop: '8px',
                marginBottom: '8px',
                maxWidth: '100%',
                cursor: productId ? 'pointer' : 'default',
                transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseEnter={(e) => {
                if (productId) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                }
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
            }}
        >
            <div style={{ position: 'relative', height: '140px', overflow: 'hidden' }}>
                <img
                    src={productImage}
                    alt={productName}
                    loading="lazy"
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                    }}
                />
                <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 500
                }}>
                    Offer
                </div>
            </div>

            <div style={{ padding: '12px' }}>
                <h4 style={{
                    margin: '0 0 4px 0',
                    fontSize: '0.9rem',
                    color: 'var(--text-primary)',
                    fontWeight: 600
                }}>
                    {productName}
                </h4>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '12px' }}>
                    <span style={{
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        color: 'var(--primary)'
                    }}>
                        {price} MAD
                    </span>
                    {originalPrice && (
                        <span style={{
                            fontSize: '0.85rem',
                            color: 'var(--text-secondary)',
                            textDecoration: 'line-through'
                        }}>
                            {originalPrice} MAD
                        </span>
                    )}
                </div>

                {status === 'pending' && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={onDecline}
                            style={{
                                flex: 1,
                                padding: '8px',
                                border: '1px solid var(--border)',
                                background: 'transparent',
                                borderRadius: '6px',
                                color: 'var(--text-secondary)',
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            Decline
                        </button>
                        <button
                            onClick={onAccept}
                            style={{
                                flex: 1,
                                padding: '8px',
                                border: 'none',
                                background: 'var(--primary)',
                                borderRadius: '6px',
                                color: 'white',
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                fontWeight: 500,
                                boxShadow: 'var(--shadow-sm)'
                            }}
                        >
                            Accept
                        </button>
                    </div>
                )}

                {status === 'accepted' && (
                    <div style={{
                        padding: '8px',
                        background: 'rgba(76, 175, 80, 0.1)',
                        color: '#4CAF50',
                        borderRadius: '6px',
                        textAlign: 'center',
                        fontSize: '0.85rem',
                        fontWeight: 500
                    }}>
                        Offer Accepted
                    </div>
                )}

                {status === 'rejected' && (
                    <div style={{
                        padding: '8px',
                        background: 'rgba(244, 67, 54, 0.1)',
                        color: '#F44336',
                        borderRadius: '6px',
                        textAlign: 'center',
                        fontSize: '0.85rem',
                        fontWeight: 500
                    }}>
                        Offer Declined
                    </div>
                )}
            </div>
        </div>
    );
}
