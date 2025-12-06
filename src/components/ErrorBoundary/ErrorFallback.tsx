interface ErrorFallbackProps {
    error: Error | null;
    onReset: () => void;
}

export default function ErrorFallback({ error, onReset }: ErrorFallbackProps) {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            background: 'var(--background)'
        }}>
            <div style={{
                maxWidth: '500px',
                width: '100%',
                padding: '32px',
                background: 'var(--surface)',
                borderRadius: '16px',
                border: '1px solid var(--border)',
                textAlign: 'center'
            }}>
                {/* Error Icon */}
                <div style={{
                    width: '64px',
                    height: '64px',
                    margin: '0 auto 24px',
                    background: '#fee2e2',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                </div>

                <h2 style={{
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    marginBottom: '12px',
                    color: 'var(--text-primary)'
                }}>
                    Oops! Something went wrong
                </h2>

                <p style={{
                    fontSize: '0.9375rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '24px',
                    lineHeight: 1.6
                }}>
                    We're sorry for the inconvenience. The page encountered an error and couldn't load properly.
                </p>

                {/* Error details in development */}
                {process.env.NODE_ENV === 'development' && error && (
                    <details style={{
                        marginBottom: '24px',
                        textAlign: 'left',
                        padding: '12px',
                        background: '#fee2e2',
                        borderRadius: '8px',
                        fontSize: '0.8125rem',
                        color: '#991b1b'
                    }}>
                        <summary style={{ cursor: 'pointer', fontWeight: 600, marginBottom: '8px' }}>
                            Error Details
                        </summary>
                        <pre style={{
                            overflow: 'auto',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word'
                        }}>
                            {error.message}
                            {'\n\n'}
                            {error.stack}
                        </pre>
                    </details>
                )}

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <button
                        onClick={onReset}
                        style={{
                            padding: '12px 24px',
                            background: 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontSize: '0.9375rem'
                        }}
                    >
                        Try Again
                    </button>
                    <button
                        onClick={() => window.location.href = '/'}
                        style={{
                            padding: '12px 24px',
                            background: 'var(--surface)',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--border)',
                            borderRadius: '8px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontSize: '0.9375rem'
                        }}
                    >
                        Go Home
                    </button>
                </div>
            </div>
        </div>
    );
}
