import { verifyEmail } from '@/app/actions/verification';
import { redirect } from 'next/navigation';

export default async function VerifyEmailPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = await params;

    const result = await verifyEmail(token);

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
                background: 'var(--surface)',
                padding: '48px',
                borderRadius: 'var(--radius-lg)',
                textAlign: 'center',
                border: '1px solid var(--border)'
            }}>
                {result.success ? (
                    <>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            background: '#4caf50',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 24px',
                            fontSize: '2rem'
                        }}>
                            ✓
                        </div>
                        <h1 style={{ marginBottom: '12px', fontFamily: 'var(--font-serif)' }}>
                            Email Verified!
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                            Your email {result.email} has been successfully verified.
                        </p>
                        <a
                            href="/profile"
                            style={{
                                display: 'inline-block',
                                padding: '12px 32px',
                                background: 'var(--primary)',
                                color: 'white',
                                textDecoration: 'none',
                                borderRadius: 'var(--radius-md)',
                                fontWeight: 600
                            }}
                        >
                            Go to Profile
                        </a>
                    </>
                ) : (
                    <>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            background: 'var(--error)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 24px',
                            fontSize: '2rem',
                            color: 'white'
                        }}>
                            ✗
                        </div>
                        <h1 style={{ marginBottom: '12px', fontFamily: 'var(--font-serif)' }}>
                            Verification Failed
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                            {result.error}
                        </p>
                        <a
                            href="/profile"
                            style={{
                                display: 'inline-block',
                                padding: '12px 32px',
                                background: 'var(--primary)',
                                color: 'white',
                                textDecoration: 'none',
                                borderRadius: 'var(--radius-md)',
                                fontWeight: 600
                            }}
                        >
                            Back to Profile
                        </a>
                    </>
                )}
            </div>
        </div>
    );
}
