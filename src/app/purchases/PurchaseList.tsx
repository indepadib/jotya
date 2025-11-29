'use client';

import { useState } from 'react';
import Link from 'next/link';
import ShipmentTracker from '@/components/ShipmentTracker';
import DisputeModal from '@/components/DisputeModal';
import { markAsDelivered } from '@/app/actions/fulfillment';

interface PurchaseListProps {
    purchases: any[];
}

export default function PurchaseList({ purchases }: PurchaseListProps) {
    const [disputeTx, setDisputeTx] = useState<any | null>(null);

    return (
        <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {purchases.map((tx) => (
                    <div key={tx.id} style={{
                        background: 'var(--surface)', borderRadius: 8, padding: 16,
                        border: '1px solid var(--border)', display: 'flex', gap: 16
                    }}>
                        <img
                            src={JSON.parse(tx.listing.images)[0]}
                            alt={tx.listing.title}
                            style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 4, background: '#f5f5f5' }}
                        />
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <div>
                                    <h3 style={{ fontWeight: 600, marginBottom: 4 }}>{tx.listing.title}</h3>
                                    <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: 8 }}>
                                        Sold by {tx.seller.name} • {tx.amount} MAD
                                    </p>
                                </div>
                                <div style={{
                                    padding: '4px 8px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 600,
                                    background: tx.status === 'DELIVERED' ? '#dcfce7' : tx.status === 'SHIPPED' ? '#e0f2fe' : '#f3f4f6',
                                    color: tx.status === 'DELIVERED' ? '#166534' : tx.status === 'SHIPPED' ? '#0369a1' : '#374151'
                                }}>
                                    {tx.status || 'PENDING'}
                                </div>
                            </div>

                            {tx.status === 'SHIPPED' && tx.trackingNumber && (
                                <div style={{ marginTop: 8 }}>
                                    <ShipmentTracker trackingNumber={tx.trackingNumber} carrier={tx.shippingMethod || 'AMANA'} />
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                                {tx.status === 'SHIPPED' && (
                                    <button
                                        onClick={async () => await markAsDelivered(tx.id)}
                                        style={{
                                            padding: '6px 12px', background: '#0ea5e9', color: 'white',
                                            borderRadius: 4, fontSize: '0.8rem', fontWeight: 600, border: 'none', cursor: 'pointer'
                                        }}
                                    >
                                        Mark as Received
                                    </button>
                                )}

                                {tx.status === 'DELIVERED' && !tx.review && (
                                    <Link
                                        href={`/reviews/${tx.id}`}
                                        style={{
                                            display: 'inline-block', padding: '6px 12px',
                                            background: 'var(--primary)', color: 'white',
                                            borderRadius: 4, fontSize: '0.8rem', fontWeight: 600,
                                            textDecoration: 'none'
                                        }}
                                    >
                                        Leave Review
                                    </Link>
                                )}

                                {tx.review && (
                                    <div style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600, alignSelf: 'center' }}>
                                        ✓ Reviewed ({tx.review.rating} ★)
                                    </div>
                                )}

                                {/* Report Issue Button */}
                                {!tx.dispute && (
                                    <button
                                        onClick={() => setDisputeTx(tx)}
                                        style={{
                                            padding: '6px 12px', background: 'transparent', color: '#ef4444',
                                            borderRadius: 4, fontSize: '0.8rem', fontWeight: 600, border: '1px solid #ef4444', cursor: 'pointer'
                                        }}
                                    >
                                        Report Issue
                                    </button>
                                )}

                                {tx.dispute && (
                                    <div style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 600, alignSelf: 'center' }}>
                                        ⚠️ Dispute Open
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {disputeTx && (
                <DisputeModal
                    transactionId={disputeTx.id}
                    itemTitle={disputeTx.listing.title}
                    onClose={() => setDisputeTx(null)}
                />
            )}
        </>
    );
}
