import styles from './analytics.module.css';

interface MetricCardProps {
    title: string;
    value: string | number;
    change?: string;
    trend?: 'up' | 'down' | 'neutral';
    icon?: string;
}

export default function MetricCard({ title, value, change, trend, icon }: MetricCardProps) {
    return (
        <div className={styles.metricCard}>
            {icon && <div className={styles.metricIcon}>{icon}</div>}
            <div className={styles.metricContent}>
                <div className={styles.metricTitle}>{title}</div>
                <div className={styles.metricValue}>{value}</div>
                {change && (
                    <div className={`${styles.metricChange} ${styles[trend || 'neutral']}`}>
                        {trend === 'up' && '↑ '}
                        {trend === 'down' && '↓ '}
                        {change}
                    </div>
                )}
            </div>
        </div>
    );
}
