import { getFavorites } from '@/app/actions/search';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function FavoritesPage() {
    const session = await getSession();
    if (!session) redirect('/login');

    const favorites = await getFavorites();

    return (
        <div style={{ padding: 16, paddingBottom: 80 }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 16 }}>My Favorites ❤️</h1>

            {favorites.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
                    <p>No favorites yet.</p>
                    <Link href="/search" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>
                        Go explore!
                    </Link>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {favorites.map((item: any) => (
                        <Link href={`/items/${item.id}`} key={item.id} style={{
                            background: 'var(--surface)', borderRadius: 8, overflow: 'hidden',
                            border: '1px solid var(--border)', textDecoration: 'none', color: 'inherit'
                        }}>
                            <img src={JSON.parse(item.images)[0]} alt={item.title} style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', background: '#f5f5f5' }} />
                            <div style={{ padding: 10 }}>
                                <div style={{ fontWeight: 700 }}>{item.price} MAD</div>
                                <div style={{ fontSize: '0.8rem', color: '#666' }}>{item.brand}</div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
