import { requireAdmin } from '@/lib/adminAuth';
import { prisma } from '@/lib/prisma';
import ListingModerationClient from './ListingModerationClient';

export default async function ListingsPage() {
    await requireAdmin();

    const listings = await prisma.listing.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            seller: {
                select: {
                    name: true,
                    email: true,
                    rating: true
                }
            }
        }
    });

    return <ListingModerationClient listings={listings} />;
}
