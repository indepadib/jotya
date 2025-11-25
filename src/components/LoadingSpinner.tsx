'use client';

interface LoadingSpinnerProps {
    size?: number;
    color?: string;
}

export default function LoadingSpinner({ size = 40, color = 'var(--primary)' }: LoadingSpinnerProps) {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px'
        }}>
            <div style={{
                width: `${size}px`,
                height: `${size}px`,
                border: `3px solid rgba(196, 120, 90, 0.1)`,
                borderTopColor: color,
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite'
            }} />
            <style jsx>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
