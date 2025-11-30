'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from '../[id]/checkout.module.css';

export default function PayPalSuccessPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
    const [message, setMessage] = useState('Processing your PayPal payment...');

    useEffect(() => {
        const processPayPalReturn = async () => {
            try {
                // Get PayPal token from URL (this is the order ID)
                const token = searchParams.get('token');
                const payerID = searchParams.get('PayerID');

                if (!token) {
                    throw new Error('No PayPal order token found');
                }

                // Retrieve checkout data from sessionStorage
                const checkoutDataStr = sessionStorage.getItem('paypalCheckoutData');
                if (!checkoutDataStr) {
                    throw new Error('Checkout data not found. Please try again.');
                }

                const checkoutData = JSON.parse(checkoutDataStr);

                // Capture the payment
                const captureRes = await fetch('/api/paypal/capture-order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        orderID: token,
                        listingId: checkoutData.listingId,
                        shippingMethod: checkoutData.shippingMethod,
                        shippingAddress: checkoutData.shippingAddress,
                        shippingCost: checkoutData.shippingCost
                    })
                });

                const captureData = await captureRes.json();

                if (!captureRes.ok) {
                    throw new Error(captureData.error || 'Failed to capture payment');
                }

                // Clear the stored data
                sessionStorage.removeItem('paypalCheckoutData');

                // Success!
                setStatus('success');
                setMessage('Payment successful! Redirecting...');

                // Redirect to purchases page
                setTimeout(() => {
                    router.push('/purchases?success=true');
                }, 2000);

            } catch (error: any) {
                console.error('PayPal payment error:', error);
                setStatus('error');
                setMessage(error.message || 'Payment processing failed');

                // Redirect to home after error
                setTimeout(() => {
                    router.push('/');
                }, 5000);
            }
        };

        processPayPalReturn();
    }, [searchParams, router]);

    return (
        <div className={styles.container}>
            <div style={{
                maxWidth: '600px',
                margin: '100px auto',
                padding: '40px',
                textAlign: 'center',
                background: 'var(--card-bg)',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}>
                {status === 'processing' && (
                    <>
                        <div style={{
                            width: '60px',
                            height: '60px',
                            border: '4px solid #f3f3f3',
                            borderTop: '4px solid var(--primary-color)',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                            margin: '0 auto 20px'
                        }} />
                        <h2>Processing Payment</h2>
                        <p style={{ color: 'var(--text-secondary)' }}>{message}</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div style={{
                            fontSize: '60px',
                            marginBottom: '20px'
                        }}>✅</div>
                        <h2 style={{ color: 'var(--success-color)' }}>Payment Successful!</h2>
                        <p style={{ color: 'var(--text-secondary)' }}>{message}</p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div style={{
                            fontSize: '60px',
                            marginBottom: '20px'
                        }}>❌</div>
                        <h2 style={{ color: 'var(--error-color)' }}>Payment Failed</h2>
                        <p style={{ color: 'var(--text-secondary)' }}>{message}</p>
                    </>
                )}
            </div>

            <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
