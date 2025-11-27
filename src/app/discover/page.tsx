'use client';

import { useState } from 'react';
import Link from 'next/link';
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
                <Link href="/" style={{ position: 'absolute', top: '20px', left: '20px', color: '#666', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Back
                </Link>
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
                <button onClick={() => setStep('gender')} style={{ position: 'absolute', top: '20px', left: '20px', background: 'none', border: 'none', color: '#666', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Back
                </button>
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
