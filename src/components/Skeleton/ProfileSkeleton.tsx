import '../Skeleton/skeleton.module.css';

export default function ProfileSkeleton() {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)', padding: '20px', paddingBottom: '100px' }}>
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    marginBottom: '24px',
                    padding: '20px',
                    background: 'var(--surface)',
                    borderRadius: '12px',
                    border: '1px solid var(--border)'
                }}>
                    {/* Avatar */}
                    <div className="skeleton circular" style={{ width: '80px', height: '80px' }} />

                    <div style={{ flex: 1 }}>
                        {/* Name */}
                        <div className="skeleton text" style={{ width: '50%', height: '20px', marginBottom: '8px' }} />
                        {/* Rating */}
                        <div className="skeleton text" style={{ width: '30%', height: '14px' }} />
                    </div>
                </div>

                {/* Stats */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '12px',
                    marginBottom: '24px'
                }}>
                    <div style={{
                        padding: '16px',
                        background: 'var(--surface)',
                        borderRadius: '12px',
                        textAlign: 'center',
                        border: '1px solid var(--border)'
                    }}>
                        <div className="skeleton text" style={{ width: '60%', height: '24px', margin: '0 auto 8px' }} />
                        <div className="skeleton text" style={{ width: '80%', height: '12px', margin: '0 auto' }} />
                    </div>
                    <div style={{
                        padding: '16px',
                        background: 'var(--surface)',
                        borderRadius: '12px',
                        textAlign: 'center',
                        border: '1px solid var(--border)'
                    }}>
                        <div className="skeleton text" style={{ width: '60%', height: '24px', margin: '0 auto 8px' }} />
                        <div className="skeleton text" style={{ width: '80%', height: '12px', margin: '0 auto' }} />
                    </div>
                    <div style={{
                        padding: '16px',
                        background: 'var(--surface)',
                        borderRadius: '12px',
                        textAlign: 'center',
                        border: '1px solid var(--border)'
                    }}>
                        <div className="skeleton text" style={{ width: '60%', height: '24px', margin: '0 auto 8px' }} />
                        <div className="skeleton text" style={{ width: '80%', height: '12px', margin: '0 auto' }} />
                    </div>
                </div>

                {/* Section title */}
                <div className="skeleton text" style={{ width: '35%', height: '18px', marginBottom: '16px' }} />

                {/* Item Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '12px'
                }}>
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} style={{
                            background: 'var(--surface)',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            border: '1px solid var(--border)'
                        }}>
                            <div className="skeleton rectangular" style={{ width: '100%', height: '150px', borderRadius: '12px 12px 0 0' }} />
                            <div style={{ padding: '12px' }}>
                                <div className="skeleton text" style={{ width: '80%', height: '14px', marginBottom: '8px' }} />
                                <div className="skeleton text" style={{ width: '40%', height: '16px' }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
