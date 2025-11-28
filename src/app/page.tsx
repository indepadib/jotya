import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import LandingPage from './LandingPage';

export const dynamic = 'force-dynamic';

export default async function Home() {
  let listings: any[] = [];
  const session = await getSession();

  try {
    // Fetch more items to shuffle
    const allListings = await prisma.listing.findMany({
      where: { status: 'AVAILABLE' },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        favoritedBy: session ? { where: { userId: session } } : false
      }
    });

    // Shuffle array
    listings = allListings.sort(() => 0.5 - Math.random()).slice(0, 12);

    // Add isFavorited flag
    listings = listings.map(l => ({
      ...l,
      isFavorited: l.favoritedBy?.length > 0
    }));

  } catch (error) {
    console.error('Database connection error:', error);
  }

  return <LandingPage featuredListings={listings} />;
}
