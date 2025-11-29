import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import PurchaseList from './PurchaseList';

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
                <PurchaseList purchases={purchases} />
            )}
        </div>
    );
}
