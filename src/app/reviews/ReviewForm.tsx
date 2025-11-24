'use client';

import { useState } from 'react';
import { createReview } from '@/app/actions/review';
import styles from './review.module.css';

interface ReviewFormProps {
    transactionId: string;
    sellerName: string;
    itemTitle: string;
}

export default function ReviewForm({ transactionId, sellerName, itemTitle }: ReviewFormProps) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            setError('Please select a rating');
            return;
        }

        setLoading(true);
        try {
            await createReview(transactionId, rating, comment);
        } catch (err: any) {
            setError(err.message || 'Failed to submit review');
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Rate your experience</h1>
            <p className={styles.subtitle}>
                How was your purchase of <strong>{itemTitle}</strong> from {sellerName}?
            </p>

            <form onSubmit={handleSubmit} className={styles.form}>
                <div>
                    <label className={styles.label} style={{ textAlign: 'center' }}>Rating</label>
                    <div className={styles.ratingContainer}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                className={`${styles.starBtn} ${star <= rating ? styles.active : ''}`}
                                onClick={() => setRating(star)}
                            >
                                ★
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className={styles.label}>Comment (Optional)</label>
                    <textarea
                        className={styles.textarea}
                        placeholder="Describe your experience..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                    />
                </div>

                {error && <div className={styles.error}>{error}</div>}

                <button type="submit" className={styles.submitBtn} disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit Review'}
                </button>
            </form>
        </div>
    );
}
