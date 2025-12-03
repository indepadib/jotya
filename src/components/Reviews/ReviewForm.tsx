'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ReviewFormProps {
    transactionId: string;
    onReviewSubmitted?: () => void;
}

export default function ReviewForm({ transactionId, onReviewSubmitted }: ReviewFormProps) {
    const router = useRouter();
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [hoveredRating, setHoveredRating] = useState(0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) return alert('Please select a rating');

        setLoading(true);
        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transactionId, rating, comment })
            });

            if (res.ok) {
                alert('Review submitted! Thank you.');
                if (onReviewSubmitted) onReviewSubmitted();
                router.refresh();
            } else {
                alert('Error submitting review');
            }
        } catch (error) {
            console.error(error);
            alert('Error submitting review');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ marginTop: 20, padding: 20, background: 'white', borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Rate your experience</h3>
            <form onSubmit={handleSubmit}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoveredRating(star)}
                            onMouseLeave={() => setHoveredRating(0)}
                            style={{
                                background: 'none',
                                border: 'none',
                                fontSize: 32,
                                cursor: 'pointer',
                                color: (hoveredRating || rating) >= star ? '#fbbf24' : '#e5e7eb',
                                transition: 'color 0.2s'
                            }}
                        >
                            ★
                        </button>
                    ))}
                </div>

                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="How was your experience with the seller?"
                    style={{
                        width: '100%',
                        padding: 12,
                        borderRadius: 8,
                        border: '1px solid #cbd5e1',
                        marginBottom: 16,
                        minHeight: 100,
                        fontFamily: 'inherit'
                    }}
                />

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        width: '100%',
                        padding: '12px',
                        background: '#0f172a',
                        color: 'white',
                        border: 'none',
                        borderRadius: 8,
                        fontWeight: 600,
                        cursor: 'pointer',
                        opacity: loading ? 0.7 : 1
                    }}
                >
                    {loading ? 'Submitting...' : 'Submit Review'}
                </button>
            </form>
        </div>
    );
}
