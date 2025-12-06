import styles from './analytics.module.css';

interface DataPoint {
    label: string;
    value: number;
}

interface SimpleBarChartProps {
    data: DataPoint[];
    title?: string;
}

export default function SimpleBarChart({ data, title }: SimpleBarChartProps) {
    const maxValue = Math.max(...data.map(d => d.value));

    return (
        <div className={styles.chartContainer}>
            {title && <h3 className={styles.chartTitle}>{title}</h3>}
            <div className={styles.barChart}>
                {data.map((item, index) => (
                    <div key={index} className={styles.barItem}>
                        <div className={styles.barLabel}>{item.label}</div>
                        <div className={styles.barWrapper}>
                            <div
                                className={styles.bar}
                                style={{ width: `${(item.value / maxValue) * 100}%` }}
                            >
                                <span className={styles.barValue}>{item.value}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
