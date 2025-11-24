'use client';

import styles from './search.module.css';

interface BreadcrumbsProps {
    path: string[];
    onNavigate: (level: number) => void;
}

export default function Breadcrumbs({ path, onNavigate }: BreadcrumbsProps) {
    if (path.length === 0) return null;

    return (
        <div className={styles.breadcrumbs}>
            <button
                className={styles.breadcrumbItem}
                onClick={() => onNavigate(-1)}
            >
                All
            </button>

            {path.map((item, index) => (
                <div key={index} className={styles.breadcrumbGroup}>
                    <span className={styles.breadcrumbSeparator}>/</span>
                    <button
                        className={`${styles.breadcrumbItem} ${index === path.length - 1 ? styles.active : ''}`}
                        onClick={() => onNavigate(index)}
                        disabled={index === path.length - 1}
                    >
                        {item.charAt(0).toUpperCase() + item.slice(1)}
                    </button>
                </div>
            ))}
        </div>
    );
}
