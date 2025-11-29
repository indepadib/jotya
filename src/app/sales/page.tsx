import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { markAsShipped } from '@/app/actions/fulfillment';
import Link from 'next/link';
import ShipmentTracker from '@/components/ShipmentTracker';

export default async function SalesPage() {
    const session = await getSession();
    if (!session) redirect('/login');

    const sales = await prisma.transaction.findMany({
        where: { sellerId: session },
        include: {
            listing: true,
            buyer: true
        },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div style={{ padding: 16, paddingBottom: 80, maxWidth: 800, margin: '0 auto' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 24 }}>My Sales 📦</h1>

            {sales.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#666', background: 'var(--surface)', borderRadius: 12 }}>
                    <p>No sales yet.</p>
                    <Link href="/sell" style={{ color: 'var(--primary)', textDecoration: 'underline', marginTop: 8, display: 'inline-block' }}>
                        List an item for sale!
                    </Link>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {sales.map((tx: any) => (
                        <div key={tx.id} style={{
                            background: 'var(--surface)', borderRadius: 12, padding: 16,
                            border: '1px solid var(--border)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                        }}>
                            {/* Header: Status & Date */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: '0.875rem' }}>
                                <span style={{ color: '#666' }}>
                                    Sold on {new Date(tx.createdAt).toLocaleDateString()}
                                </span>
                                <span style={{
                                    padding: '4px 8px', borderRadius: 4, fontWeight: 600,
                                    background: tx.status === 'DELIVERED' ? '#dcfce7' : tx.status === 'SHIPPED' ? '#e0f2fe' : '#fef3c7',
                                    color: tx.status === 'DELIVERED' ? '#166534' : tx.status === 'SHIPPED' ? '#0369a1' : '#92400e'
                                }}>
                                    {tx.status || 'PENDING'}
                                </span>
                            </div>

                            {/* Item Details */}
                            <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                                <img
                                    src={JSON.parse(tx.listing.images)[0]}
                                    alt={tx.listing.title}
                                    style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, background: '#f5f5f5' }}
                                />
                                <div>
                                    <h3 style={{ fontWeight: 600, marginBottom: 4 }}>{tx.listing.title}</h3>
                                    <p style={{ fontSize: '0.9rem', color: '#666' }}>
                                        Buyer: {tx.buyer.name}
                                    </p>
                                    <p style={{ fontSize: '0.9rem', fontWeight: 600, marginTop: 4 }}>
                                        Earnings: {tx.netAmount} MAD
                                    </p>
                                </div>
                            </div>

                            {/* Shipping Info */}
                            <div style={{ background: '#f9fafb', padding: 12, borderRadius: 8, fontSize: '0.875rem', marginBottom: 16 }}>
                                <div style={{ fontWeight: 600, marginBottom: 4 }}>Shipping Details:</div>
                                <div>Method: {tx.shippingMethod || 'Standard'}</div>
                                {tx.shippingAddress && (
                                    <div style={{ marginTop: 4, color: '#4b5563' }}>
                                        {/* @ts-ignore */}
                                        {tx.shippingAddress.street}, {tx.shippingAddress.city}<br />
                                        {/* @ts-ignore */}
                                        {tx.shippingAddress.phone}
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            {(tx.status === 'PENDING' || tx.status === 'PENDING_SHIPMENT' || tx.status === 'PAID' || tx.status === 'COMPLETED') && (
                                <div style={{ borderTop: '1px solid #eee', paddingTop: 16 }}>
                                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 8 }}>Mark as Shipped</h4>
                                    <form action={async (formData) => {
                                        'use server';
                                        const tracking = formData.get('tracking') as string;
                                        await markAsShipped(tx.id, tracking);
                                    }} style={{ display: 'flex', gap: 8 }}>
                                        <input
                                            name="tracking"
                                            type="text"
                                            placeholder="Tracking Number (Optional)"
                                            style={{
                                                flex: 1, padding: '8px 12px', borderRadius: 6,
                                                border: '1px solid #ddd', fontSize: '0.9rem'
                                            }}
                                        />
                                        <button
                                            type="submit"
                                            style={{
                                                padding: '8px 16px', background: 'var(--primary)', color: 'white',
                                                borderRadius: 6, fontWeight: 600, border: 'none', cursor: 'pointer'
                                            }}
                                        >
                                            Ship Item
                                        </button>
                                    </form>
                                </div>
                            )}

                            {tx.status === 'SHIPPED' && (
                                <div style={{ fontSize: '0.9rem', color: '#0369a1', background: '#e0f2fe', padding: 12, borderRadius: 8 }}>
                                    Waiting for buyer confirmation.
                                    {tx.trackingNumber && (
                                        <div style={{ marginTop: 8 }}>
                                            <ShipmentTracker trackingNumber={tx.trackingNumber} carrier={tx.shippingMethod || 'AMANA'} />
                                        </div>
                                    )}
                                </div>
                            )}

                            {tx.status === 'DELIVERED' && (
                                <div style={{ fontSize: '0.9rem', color: '#166534', background: '#dcfce7', padding: 12, borderRadius: 8 }}>
                                    ✅ Funds released to wallet.
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
