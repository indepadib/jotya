'use client';

import { useState } from 'react';
import CardStack from '@/components/Discover/CardStack';
import styles from '@/components/Discover/Discover.module.css';

export default function DiscoverPage() {
    const [step, setStep] = useState<'gender' | 'category' | 'swipe'>('gender');
    const [gender, setGender] = useState('');
    const [category, setCategory] = useState('');

    const handleGenderSelect = (g: string) => {
        setGender(g);
        setStep('category');
    };

    const handleCategorySelect = (c: string) => {
        setCategory(c);
        setStep('swipe');
    };

    if (step === 'gender') {
        return (
            <div className={styles.container}>
                <h1>Who are you shopping for?</h1>
                <div className={styles.categoryGrid}>
                    <div className={styles.catCard} onClick={() => handleGenderSelect('Men')}>
                        <h2>Men</h2>
                    </div>
                    <div className={styles.catCard} onClick={() => handleGenderSelect('Women')}>
                        <h2>Women</h2>
                    </div>
                </div>
            </div>
        );
    }

    if (step === 'category') {
        return (
            <div className={styles.container}>
                <h1>What are you looking for?</h1>
                <div className={styles.categoryGrid}>
                    <div className={styles.catCard} onClick={() => handleCategorySelect('Clothes')}>
                        <h2>Clothes</h2>
                    </div>
                    <div className={styles.catCard} onClick={() => handleCategorySelect('Shoes')}>
                        <h2>Shoes</h2>
                    </div>
                    <div className={styles.catCard} onClick={() => handleCategorySelect('Bags')}>
                        <h2>Bags</h2>
                    </div>
                    <div className={styles.catCard} onClick={() => handleCategorySelect('Accessories')}>
                        <h2>Accessories</h2>
                    </div>
                </div>
            </div>
        );
    }

    return <CardStack gender={gender} category={category} />;
}
