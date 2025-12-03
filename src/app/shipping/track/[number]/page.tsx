import { prisma } from '@/lib/prisma';
import { SHIPMENT_STATUS_LABELS } from '@/lib/shipping';
import { getSession } from '@/lib/auth';
import BuyerProtectionActions from '@/components/Shipping/BuyerProtectionActions';

export default async function TrackingPage({ params }: { params: { number: string } }) {
    const { number } = await params;
    const session = await getSession();

    const label = await prisma.shippingLabel.findUnique({
        where: { trackingNumber: number },
        include: {
            transaction: {
                include: {
                    listing: true
                }
            }
        }
    });

    const isBuyer = session && label?.transaction.buyerId === session;

    if (!label) {
        return (
            <div style={{ padding: 40, textAlign: 'center' }}>
                <h1>Tracking not found</h1>
                <p>Could not find shipment with number: {number}</p>
            </div>
        );
    }

    const history = (label.statusHistory as any[]) || [];
    // Sort history by timestamp desc
    const sortedHistory = [...history].sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return (
        <div style={{ padding: '40px 20px', maxWidth: 800, margin: '0 auto' }}>
            <div style={{
                background: 'white',
                borderRadius: 16,
                padding: 30,
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                border: '1px solid var(--border)'
            }}>
                <div style={{ marginBottom: 30, borderBottom: '1px solid #eee', paddingBottom: 20 }}>
                    <div style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>TRACKING NUMBER</div>
                    <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: 1 }}>{label.trackingNumber}</div>
                    <div style={{ marginTop: 8, display: 'inline-block', padding: '4px 12px', background: '#f0f0f0', borderRadius: 20, fontSize: 14, fontWeight: 600 }}>
                        {label.carrier}
                    </div>
                </div>

                <div style={{ marginBottom: 40 }}>
                    <h2 style={{ fontSize: 18, marginBottom: 20 }}>Shipment Status</h2>
                    <div style={{ position: 'relative', paddingLeft: 20 }}>
                        {sortedHistory.map((event, index) => (
                            <div key={index} style={{
                                position: 'relative',
                                paddingLeft: 30,
                                paddingBottom: 30,
                                borderLeft: index === sortedHistory.length - 1 ? 'none' : '2px solid #eee'
                            }}>
                                <div style={{
                                    position: 'absolute',
                                    left: -9,
                                    top: 0,
                                    width: 16,
                                    height: 16,
                                    borderRadius: '50%',
                                    background: index === 0 ? '#000' : '#ddd',
                                    border: '3px solid white',
                                    boxShadow: '0 0 0 1px #eee'
                                }}></div>

                                <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>
                                    {SHIPMENT_STATUS_LABELS[event.status] || event.status}
                                </div>
                                <div style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>
                                    {event.location}
                                </div>
                                <div style={{ fontSize: 12, color: '#999' }}>
                                    {new Date(event.timestamp).toLocaleString()}
                                </div>
                                {event.notes && (
                                    <div style={{ marginTop: 8, fontSize: 13, background: '#f9f9f9', padding: 8, borderRadius: 4 }}>
                                        {event.notes}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ borderTop: '1px solid #eee', paddingTop: 20 }}>
                    <h3 style={{ fontSize: 16, marginBottom: 12 }}>Item Details</h3>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                        <img
                            src={JSON.parse(label.transaction.listing.images)[0]}
                            alt="Item"
                            style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }}
                        />
                        <div>
                            <div style={{ fontWeight: 600 }}>{label.transaction.listing.title}</div>
                            <div style={{ color: '#666', fontSize: 14 }}>{label.transaction.amount} MAD</div>
                        </div>
                    </div>
                </div>

                {/* Buyer Protection Actions */}
                {isBuyer && label.status === 'DELIVERED' && label.transaction.shipmentStatus !== 'COMPLETED' && label.transaction.shipmentStatus !== 'DISPUTE' && (
                    <BuyerProtectionActions transactionId={label.transactionId} />
                )}
            </div>
        </div>
    );
}
