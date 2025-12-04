import '../Skeleton/skeleton.module.css';

export default function ItemCardSkeleton() {
    return (
        <div style={{
            background: 'var(--surface)',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '1px solid var(--border)'
        }}>
            {/* Image skeleton */}
            <div
                className="skeleton rectangular"
                style={{
                    width: '100%',
                    height: '200px',
                    borderRadius: '12px 12px 0 0'
                }}
            />

            {/* Content */}
            <div style={{ padding: '12px' }}>
                {/* Title */}
                <div
                    className="skeleton text"
                    style={{ width: '80%', height: '16px', marginBottom: '8px' }}
                />

                {/* Brand/Category */}
                <div
                    className="skeleton text"
                    style={{ width: '60%', height: '14px', marginBottom: '12px' }}
                />

                {/* Price */}
                <div
                    className="skeleton text"
                    style={{ width: '40%', height: '20px' }}
                />
            </div>
        </div>
    );
}
