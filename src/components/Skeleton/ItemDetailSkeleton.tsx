import '../Skeleton/skeleton.module.css';

export default function ItemDetailSkeleton() {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)', paddingBottom: '100px' }}>
            {/* Image Gallery Skeleton */}
            <div
                className="skeleton rectangular"
                style={{
                    width: '100%',
                    height: '150px',
                    borderRadius: 0
                }}
            />

            {/* Content */}
            <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
                {/* Brand */}
                <div
                    className="skeleton text"
                    style={{ width: '30%', height: '12px', marginBottom: '8px' }}
                />

                {/* Title */}
                <div
                    className="skeleton text"
                    style={{ width: '90%', height: '24px', marginBottom: '12px' }}
                />

                {/* Price */}
                <div
                    className="skeleton text"
                    style={{ width: '40%', height: '28px', marginBottom: '24px' }}
                />

                {/* Info chips */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
                    <div className="skeleton rectangular" style={{ width: '80px', height: '32px' }} />
                    <div className="skeleton rectangular" style={{ width: '70px', height: '32px' }} />
                    <div className="skeleton rectangular" style={{ width: '90px', height: '32px' }} />
                    <div className="skeleton rectangular" style={{ width: '75px', height: '32px' }} />
                </div>

                {/* Description */}
                <div style={{ marginBottom: '24px' }}>
                    <div className="skeleton text" style={{ width: '100%', height: '14px', marginBottom: '8px' }} />
                    <div className="skeleton text" style={{ width: '95%', height: '14px', marginBottom: '8px' }} />
                    <div className="skeleton text" style={{ width: '85%', height: '14px' }} />
                </div>

                {/* Seller Section */}
                <div style={{
                    padding: '16px',
                    background: 'var(--surface)',
                    borderRadius: '12px',
                    border: '1px solid var(--border)'
                }}>
                    <div className="skeleton text" style={{ width: '25%', height: '18px', marginBottom: '12px' }} />

                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div className="skeleton circular" style={{ width: '48px', height: '48px' }} />
                        <div style={{ flex: 1 }}>
                            <div className="skeleton text" style={{ width: '40%', height: '16px', marginBottom: '4px' }} />
                            <div className="skeleton text" style={{ width: '60%', height: '12px' }} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
