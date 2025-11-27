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
        throw error;
    }
}
