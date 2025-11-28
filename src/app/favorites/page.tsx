import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';

export const dynamic = 'force-dynamic';

export default async function FavoritesPage() {
    const session = await getSession();
    if (!session) redirect('/login');

    const favorites = await prisma.favorite.findMany({
        where: { userId: session },
        include: {
            listing: true
        },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '40px 20px'
        }}>
            <h1 style={{
                fontSize: '2rem',
                fontWeight: 700,
                marginBottom: '8px',
                color: 'var(--text-primary)'
            }}>
                Your Favorites
            </h1>
            <p style={{
                color: 'var(--text-secondary)',
                marginBottom: '32px'
            }}>
                {favorites.length} {favorites.length === 1 ? 'item' : 'items'}
            </p>

            {favorites.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '80px 20px',
                    background: 'var(--surface)',
                    borderRadius: '16px',
                    border: '1px solid var(--border)'
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>💔</div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '8px', color: 'var(--text-primary)' }}>
                        No favorites yet
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                        Start exploring and save items you love!
                    </p>
                    <Link
                        href="/search"
                        style={{
                            display: 'inline-block',
                            padding: '12px 24px',
                            background: 'var(--primary)',
                            color: 'white',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            fontWeight: 600
                        }}
                    >
                        Browse Items
                    </Link>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                    gap: '24px'
                }}>
                    {favorites.map(fav => {
                        const images = JSON.parse(fav.listing.images);
                        return (
                            <ProductCard
                                key={fav.listing.id}
                                id={fav.listing.id}
                                title={fav.listing.title}
                                price={fav.listing.price}
                                image={images[0]}
                                brand={fav.listing.brand || undefined}
                                isFavorited={true}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
}
