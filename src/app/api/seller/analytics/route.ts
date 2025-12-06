import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function GET() {
    try {
        const session = (await cookies()).get('session')?.value;
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get date 30 days ago for comparisons
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Fetch seller metrics
        const [totalEarnings, itemsSold, activeListings, completedSales, sellerRating] = await Promise.all([
            // Total earnings (netAmount from completed sales)
            prisma.transaction.aggregate({
                where: {
                    sellerId: session,
                    status: 'COMPLETED'
                },
                _sum: { netAmount: true },
                _avg: { amount: true }
            }),
            // Items sold count
            prisma.listing.count({
                where: {
                    sellerId: session,
                    status: 'SOLD'
                }
            }),
            // Active listings
            prisma.listing.count({
                where: {
                    sellerId: session,
                    status: 'AVAILABLE'
                }
            }),
            // All completed sales for charts
            prisma.transaction.findMany({
                where: {
                    sellerId: session,
                    status: 'COMPLETED'
                },
                select: {
                    amount: true,
                    netAmount: true,
                    createdAt: true,
                    listing: {
                        select: { title: true }
                    }
                },
                orderBy: { createdAt: 'desc' }
            }),
            // Seller rating
            prisma.user.findUnique({
                where: { id: session },
                select: { rating: true }
            })
        ]);

        // Calculate sales by month (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const salesByMonth = completedSales
            .filter(s => s.createdAt >= sixMonthsAgo)
            .reduce((acc, s) => {
                const month = s.createdAt.toLocaleString('default', { month: 'short' });
                acc[month] = (acc[month] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

        const earningsByMonth = completedSales
            .filter(s => s.createdAt >= sixMonthsAgo)
            .reduce((acc, s) => {
                const month = s.createdAt.toLocaleString('default', { month: 'short' });
                acc[month] = (acc[month] || 0) + s.netAmount;
                return acc;
            }, {} as Record<string, number>);

        // Top performing items (by revenue)
        const itemPerformance = completedSales.reduce((acc, sale) => {
            const title = sale.listing.title;
            if (!acc[title]) {
                acc[title] = { title, count: 0, revenue: 0 };
            }
            acc[title].count += 1;
            acc[title].revenue += sale.netAmount;
            return acc;
        }, {} as Record<string, { title: string; count: number; revenue: number }>);

        const topItems = Object.values(itemPerformance)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5)
            .map(item => ({
                label: item.title,
                value: item.revenue
            }));

        return NextResponse.json({
            metrics: {
                totalEarnings: totalEarnings._sum.netAmount || 0,
                itemsSold,
                activeListings,
                averagePrice: totalEarnings._avg.amount || 0,
                rating: sellerRating?.rating || 0
            },
            charts: {
                salesByMonth: Object.entries(salesByMonth).map(([label, value]) => ({ label, value })),
                earningsByMonth: Object.entries(earningsByMonth).map(([label, value]) => ({ label, value })),
                topItems
            }
        });
    } catch (error) {
        console.error('Error fetching seller analytics:', error);
        return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
    }
}
