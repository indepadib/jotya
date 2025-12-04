import ItemCardSkeleton from './ItemCardSkeleton';

export default function SearchResultsSkeleton() {
    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: '16px',
            padding: '20px'
        }}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <ItemCardSkeleton key={i} />
            ))}
        </div>
    );
}
