import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function GET() {
    try {
        const session = (await cookies()).get('session')?.value;
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is admin
        const user = await prisma.user.findUnique({
            where: { id: session },
            select: { isAdmin: true }
        });

        if (!user?.isAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Get date 30 days ago for comparisons
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Fetch key metrics
        const [totalRevenue, totalSales, activeUsers, activeListings, completedTransactions] = await Promise.all([
            // Total revenue from all completed transactions
            prisma.transaction.aggregate({
                where: { status: 'COMPLETED' },
                _sum: { amount: true }
            }),
            // Total sales count
            prisma.transaction.count({
                where: { status: 'COMPLETED' }
            }),
            // Active users (created account in last 30 days or have transactions)
            prisma.user.count({
                where: {
                    OR: [
                        { createdAt: { gte: thirtyDaysAgo } },
                        {
                            OR: [
                                { purchases: { some: {} } },
                                { sales: { some: {} } }
                            ]
                        }
                    ]
                }
            }),
            // Active listings (available status)
            prisma.listing.count({
                where: { status: 'AVAILABLE' }
            }),
            // Get all completed transactions for calculations
            prisma.transaction.findMany({
                where: { status: 'COMPLETED' },
                select: {
                    amount: true,
                    createdAt: true
                }
            })
        ]);

        // Calculate revenue by month (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const salesByMonth = completedTransactions
            .filter(t => t.createdAt >= sixMonthsAgo)
            .reduce((acc, t) => {
                const month = t.createdAt.toLocaleString('default', { month: 'short' });
                acc[month] = (acc[month] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

        const revenueByMonth = completedTransactions
            .filter(t => t.createdAt >= sixMonthsAgo)
            .reduce((acc, t) => {
                const month = t.createdAt.toLocaleString('default', { month: 'short' });
                acc[month] = (acc[month] || 0) + t.amount;
                return acc;
            }, {} as Record<string, number>);

        // Top categories
        const topCategories = await prisma.listing.groupBy({
            by: ['category'],
            _count: { category: true },
            where: { category: { not: null } },
            orderBy: { _count: { category: 'desc' } },
            take: 5
        });

        // Top sellers
        const topSellers = await prisma.transaction.groupBy({
            by: ['sellerId'],
            _count: { sellerId: true },
            _sum: { amount: true },
            where: { status: 'COMPLETED' },
            orderBy: { _count: { sellerId: 'desc' } },
            take: 5
        });

        // Get seller names
        const sellerIds = topSellers.map(s => s.sellerId);
        const sellers = await prisma.user.findMany({
            where: { id: { in: sellerIds } },
            select: { id: true, name: true }
        });

        const topSellersWithNames = topSellers.map(seller => ({
            name: sellers.find(s => s.id === seller.sellerId)?.name || 'Unknown',
            sales: seller._count.sellerId,
            revenue: seller._sum.amount || 0
        }));

        // Calculate conversion rate (listings sold / total listings)
        const totalListings = await prisma.listing.count();
        const soldListings = await prisma.listing.count({ where: { status: 'SOLD' } });
        const conversionRate = totalListings > 0 ? ((soldListings / totalListings) * 100).toFixed(1) : '0';

        return NextResponse.json({
            metrics: {
                totalRevenue: totalRevenue._sum.amount || 0,
                totalSales,
                activeUsers,
                activeListings,
                conversionRate: `${conversionRate}%`
            },
            charts: {
                salesByMonth: Object.entries(salesByMonth).map(([label, value]) => ({ label, value })),
                revenueByMonth: Object.entries(revenueByMonth).map(([label, value]) => ({ label, value })),
                topCategories: topCategories.map(c => ({
                    label: c.category || 'Uncategorized',
                    value: c._count.category
                })),
                topSellers: topSellersWithNames
            }
        });
    } catch (error) {
        console.error('Error fetching admin analytics:', error);
        return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
    }
}
