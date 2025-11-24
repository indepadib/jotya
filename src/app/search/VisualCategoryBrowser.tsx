'use client';

import React, { useState } from 'react';
import { categories, GenderKey } from './categories';
import Breadcrumbs from './Breadcrumbs';
import styles from './search.module.css';

interface VisualCategoryBrowserProps {
    onCategorySelect: (path: string[]) => void;
    onClose?: () => void;
}

export default function VisualCategoryBrowser({ onCategorySelect, onClose }: VisualCategoryBrowserProps) {
    const [selectedPath, setSelectedPath] = useState<string[]>([]);

    const handleSelect = (level: number, value: string) => {
        const newPath = selectedPath.slice(0, level);
        newPath.push(value);
        setSelectedPath(newPath);
    };

    const handleNavigate = (level: number) => {
        if (level === -1) {
            setSelectedPath([]);
        } else {
            setSelectedPath(selectedPath.slice(0, level + 1));
        }
    };

    const handleFinalSelect = (path: string[]) => {
        onCategorySelect(path);
    };

    // Level 0: Show Gender blocks (Men, Women, Kids, Creators)
    if (selectedPath.length === 0) {
        return (
            <div className={styles.visualBrowser}>
                <h2 className={styles.browserTitle}>Browse by Category</h2>
                <div className={styles.genderBlocks}>
                    {Object.entries(categories).map(([key, gender]) => (
                        <button
                            key={key}
                            className={styles.genderBlock}
                            onClick={() => handleSelect(0, key)}
                        >
                            <div className={styles.genderIcon}>{getGenderIcon(key)}</div>
                            <h3 className={styles.genderName}>{gender.name}</h3>
                            <svg className={styles.chevron} width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    // Level 1: Show Category blocks (All, Clothes, Shoes, Accessories, Care)
    const genderKey = selectedPath[0] as GenderKey;
    const gender = categories[genderKey];

    if (selectedPath.length === 1) {
        return (
            <div className={styles.visualBrowser}>
                <Breadcrumbs path={selectedPath} onNavigate={handleNavigate} />
                <h2 className={styles.browserTitle}>{gender.name}</h2>
                <div className={styles.categoryBlocks}>
                    {Object.entries(gender.categories).map(([key, category]) => (
                        <button
                            key={key}
                            className={styles.categoryBlock}
                            onClick={() => {
                                if ('types' in category) {
                                    handleSelect(1, key);
                                } else {
                                    handleFinalSelect([...selectedPath, key]);
                                }
                            }}
                        >
                            {getCategoryIcon(key)}
                            <span className={styles.categoryBlockName}>{category.name}</span>
                            <svg className={styles.chevron} width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    // Level 2: Show Type list (Jeans, Coats, etc.)
    const categoryKey = selectedPath[1];
    const category = gender.categories[categoryKey as keyof typeof gender.categories];

    if (selectedPath.length === 2 && category && 'types' in category) {
        return (
            <div className={styles.visualBrowser}>
                <Breadcrumbs path={selectedPath} onNavigate={handleNavigate} />
                <h2 className={styles.browserTitle}>{category.name}</h2>
                <div className={styles.typeGrid}>
                    {Object.entries(category.types as object).map(([key, type]: [string, any]) => (
                        <button
                            key={key}
                            className={styles.typeCard}
                            onClick={() => {
                                if (type && 'subtypes' in type) {
                                    handleSelect(2, key);
                                } else {
                                    handleFinalSelect([...selectedPath, key]);
                                }
                            }}
                        >
                            <span className={styles.typeCardName}>{type.name}</span>
                            {type && 'subtypes' in type ? (
                                <svg className={styles.chevron} width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            ) : null}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    // Level 3: Show Subtypes
    const typeKey = selectedPath[2];
    const type = category && 'types' in category ? (category.types as any)[typeKey] : null;

    if (selectedPath.length === 3 && type && 'subtypes' in type) {
        return (
            <div className={styles.visualBrowser}>
                <Breadcrumbs path={selectedPath} onNavigate={handleNavigate} />
                <h2 className={styles.browserTitle}>{type.name}</h2>
                <div className={styles.subtypeGrid}>
                    {type.subtypes.map((subtype: string) => (
                        <button
                            key={subtype}
                            className={styles.subtypeCard}
                            onClick={() => handleFinalSelect([...selectedPath, subtype])}
                        >
                            {subtype}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    return null;
}

// Gender icons
function getGenderIcon(key: string) {
    const icons: Record<string, React.JSX.Element> = {
        men: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="10" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
                <path d="M3 21v-2a4 4 0 014-4h6a4 4 0 014 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
        ),
        women: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
                <path d="M5.5 21v-2a4 4 0 014-4h5a4 4 0 014 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
        ),
        kids: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="6" r="3" stroke="currentColor" strokeWidth="2" />
                <path d="M6 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
        ),
        creators: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="2" />
            </svg>
        ),
    };
    return icons[key] || icons.men;
}

// Category icons
function getCategoryIcon(key: string) {
    const icons: Record<string, React.JSX.Element> = {
        all: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" rx="1" />
                <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" rx="1" />
                <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" rx="1" />
                <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" rx="1" />
            </svg>
        ),
        clothes: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a1 1 0 00.99.84H6v10a2 2 0 002 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.47a2 2 0 00-1.34-2.23z" stroke="currentColor" strokeWidth="2" />
            </svg>
        ),
        shoes: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M2 17l4-9 4 2 4-2 4 2 4-2v11H2v-2z" stroke="currentColor" strokeWidth="2" />
            </svg>
        ),
        accessories: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="currentColor" strokeWidth="2" />
                <path d="M3 6h18M16 10a4 4 0 01-8 0" stroke="currentColor" strokeWidth="2" />
            </svg>
        ),
        care: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
        ),
    };
    return icons[key] || icons.all;
}
