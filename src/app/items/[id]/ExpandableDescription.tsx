'use client';

import { useState } from 'react';
import styles from './item.module.css';

interface ExpandableDescriptionProps {
    description: string;
}

export default function ExpandableDescription({ description }: ExpandableDescriptionProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className={styles.descriptionSection}>
            <h3 className={styles.sectionTitle}>Description</h3>
            <p
                className={`${styles.description} ${isExpanded ? styles.descriptionExpanded : ''
                    }`}
            >
                {description}
            </p>
            {description.length > 150 && (
                <button
                    className={styles.readMoreBtn}
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    {isExpanded ? 'Show Less ▲' : 'Read More ▼'}
                </button>
            )}
        </div>
    );
}
