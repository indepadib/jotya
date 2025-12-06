'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import MetricCard from '@/components/Analytics/MetricCard';
import SimpleBarChart from '@/components/Analytics/SimpleBarChart';
import SimpleLineChart from '@/components/Analytics/SimpleLineChart';
import styles from './seller-analytics.module.css';

interface SellerAnalyticsData {
    metrics: {
        totalEarnings: number;
        itemsSold: number;
        activeListings: number;
        averagePrice: number;
        rating: number;
    };
    charts: {
        salesByMonth: Array<{ label: string; value: number }>;
        earningsByMonth: Array<{ label: string; value: number }>;
        topItems: Array<{ label: string; value: number }>;
    };
}

export default function SellerAnalyticsPage() {
    const [data, setData] = useState<SellerAnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const res = await fetch('/api/seller/analytics');
            if (res.ok) {
                setData(await res.json());
            }
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1>My Analytics</h1>
                </div>
                <div className="skeleton rectangular" style={{ width: '100%', height: '400px' }} />
            </div>
        );
    }

    if (!data) {
        return (
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1>My Analytics</h1>
                </div>
                <p>Failed to load analytics data</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Link href="/profile" className={styles.backBtn}>← Back to Profile</Link>
                <h1>My Performance</h1>
            </div>

            {/* Key Metrics */}
            <div className={styles.metricsGrid}>
                <MetricCard
                    title="Total Earnings"
                    value={`${data.metrics.totalEarnings.toLocaleString()} MAD`}
                    icon="💰"
                    trend="up"
                />
                <MetricCard
                    title="Items Sold"
                    value={data.metrics.itemsSold.toLocaleString()}
                    icon="✓"
                />
                <MetricCard
                    title="Active Listings"
                    value={data.metrics.activeListings.toLocaleString()}
                    icon="📦"
                />
                <MetricCard
                    title="Average Sale Price"
                    value={`${Math.round(data.metrics.averagePrice).toLocaleString()} MAD`}
                    icon="💵"
                />
                <MetricCard
                    title="Seller Rating"
                    value={data.metrics.rating.toFixed(1)}
                    icon="⭐"
                />
            </div>

            {/* Charts Section */}
            <div className={styles.chartsGrid}>
                <div className={styles.chartItem}>
                    <SimpleLineChart
                        data={data.charts.salesByMonth}
                        title="Sales Over Time (Last 6 Months)"
                    />
                </div>

                <div className={styles.chartItem}>
                    <SimpleLineChart
                        data={data.charts.earningsByMonth}
                        title="Earnings Over Time (Last 6 Months)"
                        color="#10b981"
                    />
                </div>

                <div className={styles.fullWidthChart}>
                    <SimpleBarChart
                        data={data.charts.topItems}
                        title="Top Performing Items (By Revenue)"
                    />
                </div>
            </div>

            {/* Tips Section */}
            <div className={styles.tipsCard}>
                <h3>💡 Tips to Improve Performance</h3>
                <ul>
                    <li>✨ Add high-quality photos to your listings</li>
                    <li>📝 Write detailed, accurate descriptions</li>
                    <li>⚡ Respond quickly to messages and offers</li>
                    <li>💰 Price competitively based on condition</li>
                    <li>📦 Ship items promptly after sale</li>
                </ul>
            </div>
        </div>
    );
}
