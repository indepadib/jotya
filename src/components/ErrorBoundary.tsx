'use client';

import React, { Component, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Log error to console in development
        if (process.env.NODE_ENV === 'development') {
            console.error('Error caught by boundary:', error, errorInfo);
        }

        // In production, you could send to error tracking service (Sentry, etc.)
        // logErrorToService(error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default fallback UI matching Jotya design system
            return (
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '40px 20px',
                    textAlign: 'center',
                    background: 'var(--background)'
                }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        background: 'rgba(196, 120, 90, 0.1)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '24px',
                        color: 'var(--primary)'
                    }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                    </div>

                    <h1 style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '1.75rem',
                        color: 'var(--text-primary)',
                        marginBottom: '12px',
                        fontWeight: 700
                    }}>
                        Oops! Something went wrong
                    </h1>

                    <p style={{
                        color: 'var(--text-secondary)',
                        marginBottom: '32px',
                        maxWidth: '400px',
                        lineHeight: '1.6'
                    }}>
                        We encountered an unexpected error. Please try refreshing the page or return to the homepage.
                    </p>

                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <button
                            onClick={() => window.location.reload()}
                            style={{
                                padding: '14px 28px',
                                background: 'var(--primary)',
                                color: 'white',
                                border: 'none',
                                borderRadius: 'var(--radius-full)',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                boxShadow: '0 4px 12px rgba(196, 120, 90, 0.3)'
                            }}
                        >
                            Refresh Page
                        </button>

                        <button
                            onClick={() => window.location.href = '/'}
                            style={{
                                padding: '14px 28px',
                                background: 'white',
                                color: 'var(--primary)',
                                border: '2px solid var(--primary)',
                                borderRadius: 'var(--radius-full)',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            Go to Homepage
                        </button>
                    </div>

                    {process.env.NODE_ENV === 'development' && this.state.error && (
                        <details style={{
                            marginTop: '40px',
                            padding: '16px',
                            background: '#f5f5f5',
                            borderRadius: '8px',
                            maxWidth: '600px',
                            textAlign: 'left',
                            fontSize: '0.875rem'
                        }}>
                            <summary style={{ cursor: 'pointer', fontWeight: 600, marginBottom: '8px' }}>
                                Error Details (Development Only)
                            </summary>
                            <pre style={{
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                                color: '#c4785a',
                                fontSize: '0.8125rem'
                            }}>
                                {this.state.error.toString()}
                            </pre>
                        </details>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}
