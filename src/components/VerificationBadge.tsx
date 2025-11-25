'use client';

import Icon from './icons/Icon';
import styles from './VerificationBadge.module.css';

interface VerificationBadgeProps {
    phoneVerified?: boolean;
    emailVerified?: boolean;
    idVerified?: boolean;
    topRatedSeller?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export default function VerificationBadge({
    phoneVerified = false,
    emailVerified = false,
    idVerified = false,
    topRatedSeller = false,
    size = 'md'
}: VerificationBadgeProps) {
    const badges = [];

    if (topRatedSeller) {
        badges.push({
            key: 'top',
            icon: 'star',
            label: 'Top Rated',
            className: styles.gold
        });
    }

    if (idVerified) {
        badges.push({
            key: 'id',
            icon: 'checkCircle',
            label: 'ID Verified',
            className: styles.verified
        });
    }

    if (phoneVerified) {
        badges.push({
            key: 'phone',
            icon: 'phone',
            label: 'Phone',
            className: styles.verified
        });
    }

    if (emailVerified) {
        badges.push({
            key: 'email',
            icon: 'mail',
            label: 'Email',
            className: styles.verified
        });
    }

    if (badges.length === 0) return null;

    return (
        <div className={styles.container}>
            {badges.map(badge => (
                <div
                    key={badge.key}
                    className={`${styles.badge} ${styles[size]} ${badge.className}`}
                    title={badge.label}
                >
                    <Icon
                        name={badge.icon as any}
                        size={size === 'sm' ? 12 : size === 'md' ? 14 : 16}
                        strokeWidth={2}
                    />
                    <span className={styles.label}>{badge.label}</span>
                </div>
            ))}
        </div>
    );
}
