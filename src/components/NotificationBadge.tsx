import styles from './NotificationBadge.module.css';

interface NotificationBadgeProps {
    count: number;
    max?: number;
}

export default function NotificationBadge({ count, max = 99 }: NotificationBadgeProps) {
    if (count === 0) return null;

    const displayCount = count > max ? `${max}+` : count.toString();

    return (
        <span className={styles.badge}>
            {displayCount}
        </span>
    );
}
