'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import MetricCard from '@/components/Analytics/MetricCard';
import SimpleBarChart from '@/components/Analytics/SimpleBarChart';
import SimpleLineChart from '@/components/Analytics/SimpleLineChart';
import styles from './analytics.module.css';

interface AnalyticsData {
    metrics: {
        totalRevenue: number;
        totalSales: number;
        activeUsers: number;
        activeListings: number;
        conversionRate: string;
    };
    charts: {
        salesByMonth: Array<{ label: string; value: number }>;
        revenueByMonth: Array<{ label: string; value: number }>;
        topCategories: Array<{ label: string; value: number }>;
        topSellers: Array<{ name: string; sales: number; revenue: number }>;
    };
}

export default function AdminAnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const res = await fetch('/api/admin/analytics');
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
                    <h1>Platform Analytics</h1>
                </div>
                <div className="skeleton rectangular" style={{ width: '100%', height: '400px' }} />
            </div>
        );
    }

    if (!data) {
        return (
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1>Platform Analytics</h1>
                </div>
                <p>Failed to load analytics data</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Link href="/admin" className={styles.backBtn}>← Back to Admin</Link>
                <h1>Platform Analytics</h1>
            </div>

            {/* Key Metrics */}
            <div className={styles.metricsGrid}>
                <MetricCard
                    title="Total Revenue"
                    value={`${data.metrics.totalRevenue.toLocaleString()} MAD`}
                    icon="💰"
                    trend="up"
                />
                <MetricCard
                    title="Total Sales"
                    value={data.metrics.totalSales.toLocaleString()}
                    icon="📦"
                    trend="up"
                />
                <MetricCard
                    title="Active Users"
                    value={data.metrics.activeUsers.toLocaleString()}
                    icon="👥"
                />
                <MetricCard
                    title="Active Listings"
                    value={data.metrics.activeListings.toLocaleString()}
                    icon="🏷️"
                />
                <MetricCard
                    title="Conversion Rate"
                    value={data.metrics.conversionRate}
                    icon="📈"
                    trend="up"
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
                        data={data.charts.revenueByMonth}
                        title="Revenue Over Time (Last 6 Months)"
                        color="#10b981"
                    />
                </div>

                <div className={styles.chartItem}>
                    <SimpleBarChart
                        data={data.charts.topCategories}
                        title="Top Categories"
                    />
                </div>

                <div className={styles.chartItem}>
                    <div className={styles.topSellersCard}>
                        <h3>Top Sellers</h3>
                        <div className={styles.topSellersList}>
                            {data.charts.topSellers.map((seller, index) => (
                                <div key={index} className={styles.topSellerItem}>
                                    <div className={styles.sellerRank}>#{index + 1}</div>
                                    <div className={styles.sellerInfo}>
                                        <div className={styles.sellerName}>{seller.name}</div>
                                        <div className={styles.sellerStats}>
                                            {seller.sales} sales · {seller.revenue.toLocaleString()} MAD
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
