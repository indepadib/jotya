import { prisma } from '@/lib/prisma';

export async function checkAndUpdateTopRatedStatus(userId: string) {
    // Get user stats
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            sales: {
                where: {
                    status: 'DELIVERED',
                    createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
                }
            }
        }
    });

    if (!user) return;

    const totalSales = user.sales.length;
    const rating = user.rating;

    // Criteria: Rating >= 4.8 AND at least 10 sales in last 30 days
    const shouldBeTopRated = rating >= 4.8 && totalSales >= 10;

    // Only update if status changed
    if (user.topRatedSeller !== shouldBeTopRated) {
        await prisma.user.update({
            where: { id: userId },
            data: { topRatedSeller: shouldBeTopRated }
        });
    }

    return shouldBeTopRated;
}
