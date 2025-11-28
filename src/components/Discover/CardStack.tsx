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
            console.log('[CardStack] Loading items for:', { gender, category });
            const initial = await getInitialItems(gender, category);
            console.log('[CardStack] Received items:', initial.length, initial);
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

            // Save to favorites
            try {
                const { toggleFavorite } = await import('@/app/actions/favorite');
                await toggleFavorite(id);
            } catch (error) {
                console.error('Failed to save favorite:', error);
            }

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

    if (loading) {
        console.log('[CardStack] Still loading...');
        return <div className={styles.container}>Loading discovery...</div>;
    }
    if (items.length === 0) {
        console.log('[CardStack] No items to display!');
        return <div className={styles.container}>No more items! Check back later.</div>;
    }

    console.log('[CardStack] Rendering', items.length, 'items');

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
