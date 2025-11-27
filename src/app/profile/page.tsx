import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ProfileView from './ProfileView';

export default async function ProfilePage() {
    try {
        const session = await getSession();
        console.log('[Profile] Session:', session);

        if (!session) redirect('/login');

        const user = await prisma.user.findUnique({
            where: { id: session },
            include: {
                listings: { where: { status: 'AVAILABLE' } },
                sales: { orderBy: { createdAt: 'desc' } },
                purchases: true,
                reviewsReceived: true,
                wallet: true
            }
        });

        console.log('[Profile] User found:', !!user);

        if (!user) redirect('/login');

        // Calculate KPIs
        const stats = {
            totalListings: user.listings.length,
            totalSales: user.sales.length,
            totalRevenue: user.sales.reduce((sum, sale) => sum + sale.netAmount, 0),
            avgRating: user.rating.toFixed(1),
            walletBalance: user.wallet?.balance || 0
        };

        return <ProfileView user={user} stats={stats} />;
    } catch (error) {
        console.error('[Profile] Error:', error);

        // Show error details to user for debugging
        return (
            <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
                <h1>Profile Error</h1>
                <div style={{
                    background: '#fee',
                    padding: '20px',
                    borderRadius: '8px',
                    marginTop: '20px',
                    fontFamily: 'monospace',
                    fontSize: '14px'
                }}>
                    <strong>Error:</strong>
                    <pre style={{ whiteSpace: 'pre-wrap', marginTop: '10px' }}>
                        {error instanceof Error ? error.message : String(error)}
                    </pre>
                    {error instanceof Error && error.stack && (
                        <>
                            <strong style={{ marginTop: '20px', display: 'block' }}>Stack:</strong>
                            <pre style={{ whiteSpace: 'pre-wrap', marginTop: '10px', fontSize: '12px' }}>
                                {error.stack}
                            </pre>
                        </>
                    )}
                </div>
                <p style={{ marginTop: '20px' }}>
                    <a href="/" style={{ color: '#FF4081' }}>← Back to Home</a>
                </p>
            </div>
        );
    }
}
