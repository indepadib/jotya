import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import LandingPage from './LandingPage';
import { lookupListingsReferences } from '@/lib/listingHelpers';
import { Suspense } from 'react';
import ItemCardSkeleton from '@/components/Skeleton/ItemCardSkeleton';

export const dynamic = 'force-dynamic';

function HomeSkeleton() {
  return (
    <div style={{
      padding: '20px',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
      gap: '16px'
    }}>
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <ItemCardSkeleton key={i} />
      ))}
    </div>
  );
}

async function HomeContent() {
  // Get current user session
  const session = (await cookies()).get('session')?.value;

  let listings: any[] = [];

  try {
    // Optimized query - select only needed fields
    const rawListings = await prisma.listing.findMany({
      where: { status: 'AVAILABLE' },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        title: true,
        price: true,
        images: true,
        verified: true,
        brand: true,
        color: true,
        size: true,
        brandRef: { select: { id: true, name: true } },
        colorRef: { select: { id: true, name: true } },
        sizeRef: { select: { id: true, value: true } },
        _count: session ? {
          select: { favoritedBy: { where: { userId: session } } }
        } : false
      }
    });

    // Shuffle array
    const shuffled = rawListings.sort(() => 0.5 - Math.random()).slice(0, 12);

    // Add isFavorited flag
    const withFavorites = shuffled.map(l => ({
      ...l,
      isFavorited: l._count?.favoritedBy > 0
    }));

    // Lookup brand/color/size values if they're IDs
    listings = await lookupListingsReferences(withFavorites);

  } catch (error) {
    console.error('Database connection error:', error);
  }

  return <LandingPage featuredListings={listings} />;
}

export default function Home() {
  return (
    <Suspense fallback={<HomeSkeleton />}>
      <HomeContent />
    </Suspense>
  );
}
