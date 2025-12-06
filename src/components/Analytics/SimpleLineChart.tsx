import styles from './analytics.module.css';

interface DataPoint {
    label: string;
    value: number;
}

interface SimpleLineChartProps {
    data: DataPoint[];
    title?: string;
    color?: string;
}

export default function SimpleLineChart({ data, title, color = 'var(--primary)' }: SimpleLineChartProps) {
    if (data.length === 0) return null;

    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const range = maxValue - minValue || 1;

    // Create SVG path points
    const points = data.map((point, index) => {
        const x = (index / (data.length - 1)) * 100;
        const y = 100 - ((point.value - minValue) / range) * 100;
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className={styles.chartContainer}>
            {title && <h3 className={styles.chartTitle}>{title}</h3>}
            <div className={styles.lineChart}>
                <svg viewBox="0 0 100 100" preserveAspectRatio="none">
                    <polyline
                        points={points}
                        fill="none"
                        stroke={color}
                        strokeWidth="2"
                        vectorEffect="non-scaling-stroke"
                    />
                    {/* Area under line */}
                    <polygon
                        points={`0,100 ${points} 100,100`}
                        fill={color}
                        opacity="0.1"
                    />
                </svg>
                <div className={styles.lineChartLabels}>
                    {data.map((point, index) => (
                        <div key={index} className={styles.lineChartLabel}>
                            {point.label}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
