'use client';

import { useState, useEffect } from 'react';
import SwipeCard from './SwipeCard';
import styles from './Discover.module.css';
import { getInitialItems, getRecommendedItems } from '@/app/actions/discover';

interface CardStackProps {
    gender: string;
    category: string;
}

export default function CardStack({ gender, category }: CardStackProps) {
    const [items, setItems] = useState<any[]>([]);
    const [likedIds, setLikedIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    // Load initial items
    useEffect(() => {
        const load = async () => {
            const initial = await getInitialItems(gender, category);
            setItems(initial);
            setLoading(false);
        };
        load();
    }, [gender, category]);

    // Handle swipe
    const handleSwipe = async (direction: 'left' | 'right', id: string) => {
        // Remove the swiped card
        setItems(prev => prev.filter(item => item.id !== id));

        if (direction === 'right') {
            console.log('Liked item:', id);
            const newLikedIds = [...likedIds, id];
            setLikedIds(newLikedIds);

            // Every 3 likes, fetch recommendations
            if (newLikedIds.length % 3 === 0) {
                console.log('Fetching recommendations...');
                const recs = await getRecommendedItems(newLikedIds);
                if (recs.length > 0) {
                    console.log('Got recommendations:', recs.length);
                    setItems(prev => [...prev, ...recs]);
                }
            }
        }
    };

    if (loading) return <div className={styles.container}>Loading discovery...</div>;
    if (items.length === 0) return <div className={styles.container}>No more items! Check back later.</div>;

    return (
        <div className={styles.container}>
            <div className={styles.cardStack}>
                {items.slice(0, 3).reverse().map((item, index) => (
                    <SwipeCard
                        key={item.id}
                        item={item}
                        onSwipe={(dir) => handleSwipe(dir, item.id)}
                        style={{
                            zIndex: index,
                            scale: 1 - (items.length - 1 - index) * 0.05,
                            top: (items.length - 1 - index) * 10
                        }}
                    />
                ))}
            </div>

            <div className={styles.controls}>
                <button className={`${styles.controlBtn} ${styles.passBtn}`} onClick={() => handleSwipe('left', items[0].id)}>
                    ✕
                </button>
                <button className={`${styles.controlBtn} ${styles.likeBtn}`} onClick={() => handleSwipe('right', items[0].id)}>
                    ♥
                </button>
            </div>
        </div>
    );
}
