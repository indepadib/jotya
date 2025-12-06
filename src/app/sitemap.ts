import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Base URL
    const baseUrl = 'https://jotya.ma';

    // Static routes
    const routes = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 1,
        },
        {
            url: `${baseUrl}/discover`,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 0.9,
        },
        {
            url: `${baseUrl}/search`,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 0.9,
        },
        {
            url: `${baseUrl}/sell`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.8,
        },
    ];

    // Dynamic listing routes
    try {
        const listings = await prisma.listing.findMany({
            where: {
                status: 'AVAILABLE',
            },
            select: {
                id: true,
                updatedAt: true,
            },
            take: 1000, // Limit for performance
        });

        const listingRoutes = listings.map((listing) => ({
            url: `${baseUrl}/items/${listing.id}`,
            lastModified: listing.updatedAt,
            changeFrequency: 'weekly' as const,
            priority: 0.7,
        }));

        return [...routes, ...listingRoutes];
    } catch (error) {
        console.error('Error generating sitemap:', error);
        return routes;
    }
}
