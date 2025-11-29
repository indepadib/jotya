import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import ShipmentTracker from '@/components/ShipmentTracker';

interface PurchasesPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PurchasesPage({ searchParams }: PurchasesPageProps) {
    const session = await getSession();
    if (!session) redirect('/login');

    const params = await searchParams;
    const showSuccess = params?.success === 'true';

    const purchases = await prisma.transaction.findMany({
        where: { buyerId: session },
        include: {
            listing: true,
            seller: true,
            review: true
        },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div style={{ padding: 16, paddingBottom: 80 }}>
            {showSuccess && (
                <div style={{
                    background: '#dcfce7', color: '#166534', padding: '12px 16px',
                    borderRadius: 8, marginBottom: 16, border: '1px solid #bbf7d0',
                    display: 'flex', alignItems: 'center', gap: 8
                }}>
                    <span>🎉</span>
                    <div>
                        <strong>Payment Successful!</strong>
                        <div style={{ fontSize: '0.9rem' }}>Your order has been confirmed.</div>
                    </div>
                </div>
            )}
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 16 }}>My Purchases 🛍️</h1>

            {purchases.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
                    <p>No purchases yet.</p>
                    <Link href="/search" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>
                        Start shopping!
                    </Link>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {purchases.map((tx: any) => (
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

                                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                                    {tx.status === 'SHIPPED' && (
                                        <form action={async () => {
                                            'use server';
                                            await import('@/app/actions/fulfillment').then(m => m.markAsDelivered(tx.id));
                                        }}>
                                            <button
                                                type="submit"
                                                style={{
                                                    padding: '6px 12px', background: '#0ea5e9', color: 'white',
                                                    borderRadius: 4, fontSize: '0.8rem', fontWeight: 600, border: 'none', cursor: 'pointer'
                                                }}
                                            >
                                                Mark as Received
                                            </button>
                                        </form>
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
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
