export default function LoadingSkeleton() {
    return (
        <div style={{ padding: '24px' }}>
            {/* Header Skeleton */}
            <div style={{
                height: '32px',
                width: '40%',
                background: 'linear-gradient(90deg, var(--border) 0%, var(--surface) 50%, var(--border) 100%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s ease-in-out infinite',
                borderRadius: 'var(--radius-md)',
                marginBottom: '24px'
            }} />

            {/* Grid Skeleton */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                gap: '16px'
            }}>
                {[...Array(6)].map((_, i) => (
                    <div key={i} style={{
                        background: 'var(--surface)',
                        borderRadius: 'var(--radius-lg)',
                        overflow: 'hidden',
                        border: '1px solid var(--border)'
                    }}>
                        {/* Image skeleton */}
                        <div style={{
                            aspectRatio: '3/4',
                            background: 'linear-gradient(90deg, var(--border) 0%, var(--surface) 50%, var(--border) 100%)',
                            backgroundSize: '200% 100%',
                            animation: 'shimmer 1.5s ease-in-out infinite'
                        }} />

                        {/* Content skeleton */}
                        <div style={{ padding: '12px' }}>
                            <div style={{
                                height: '16px',
                                width: '60%',
                                background: 'linear-gradient(90deg, var(--border) 0%, var(--surface) 50%, var(--border) 100%)',
                                backgroundSize: '200% 100%',
                                animation: 'shimmer 1.5s ease-in-out infinite',
                                borderRadius: '4px',
                                marginBottom: '8px'
                            }} />
                            <div style={{
                                height: '20px',
                                width: '40%',
                                background: 'linear-gradient(90deg, var(--border) 0%, var(--surface) 50%, var(--border) 100%)',
                                backgroundSize: '200% 100%',
                                animation: 'shimmer 1.5s ease-in-out infinite',
                                borderRadius: '4px'
                            }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
