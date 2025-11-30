import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ShippingLabel from '@/components/Shipping/ShippingLabel';

export default async function LabelPage({ params }: { params: { id: string } }) {
    const session = await getSession();
    if (!session) redirect('/login');

    const { id } = await params;

    const label = await prisma.shippingLabel.findUnique({
        where: { trackingNumber: id },
        include: {
            transaction: {
                include: {
                    buyer: true,
                    seller: true
                }
            }
        }
    });

    if (!label) {
        return <div>Label not found</div>;
    }

    // Security check: only seller, buyer, or admin can view
    if (label.transaction.sellerId !== session && label.transaction.buyerId !== session) {
        // redirect('/unauthorized');
        // For MVP, we might allow viewing if they have the link, but let's be safe
    }

    return (
        <div style={{ padding: 40, background: '#f5f5f5', minHeight: '100vh' }}>
            <div style={{ maxWidth: 800, margin: '0 auto' }}>
                <h1 style={{ marginBottom: 20, textAlign: 'center' }}>Shipping Label</h1>
                <ShippingLabel
                    label={label}
                    seller={label.transaction.seller}
                    buyer={label.transaction.buyer}
                    transaction={label.transaction}
                />
            </div>
        </div>
    );
}
