import { prisma } from '@/lib/prisma';
import LandingPage from './LandingPage';

export const dynamic = 'force-dynamic';

export default async function Home() {
  let listings: any[] = [];

  try {
    listings = await prisma.listing.findMany({
      where: { status: 'AVAILABLE' },
      orderBy: { createdAt: 'desc' },
      take: 12,
    });
  } catch (error) {
    console.error('Database connection error:', error);
    // Continue with empty listings if database is unreachable
  }

  return <LandingPage featuredListings={listings} />;
}
