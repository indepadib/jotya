import { requireAdmin } from '@/lib/adminAuth';
import { getPlatformStats } from '@/app/actions/admin';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import styles from './admin.module.css';

export default async function AdminPage() {
    await requireAdmin();

    const stats = await getPlatformStats();

    // Recent listings for quick review
    const recentListings = await prisma.listing.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { seller: { select: { name: true, email: true } } }
    });

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Admin Dashboard</h1>
                <Link href="/" className={styles.backBtn}>← Back to Site</Link>
            </div>

            {/* Platform Stats */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: '#e3f2fd' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2196f3" strokeWidth="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87m-4-12a4 4 0 0 1 0 7.75"></path>
                        </svg>
                    </div>
                    <div className={styles.statValue}>{stats.totalUsers}</div>
                    <div className={styles.statLabel}>Total Users</div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: '#fff3e0' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff9800" strokeWidth="2">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                        </svg>
                    </div>
                    <div className={styles.statValue}>{stats.totalListings}</div>
                    <div className={styles.statLabel}>Total Listings</div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: '#e8f5e9' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4caf50" strokeWidth="2">
                            <line x1="12" y1="1" x2="12" y2="23"></line>
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                        </svg>
                    </div>
                    <div className={styles.statValue}>{stats.totalRevenue.toFixed(0)} MAD</div>
                    <div className={styles.statLabel}>Total Revenue</div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: '#fce4ec' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e91e63" strokeWidth="2">
                            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                        </svg>
                    </div>
                    <div className={styles.statValue}>{stats.totalTransactions}</div>
                    <div className={styles.statLabel}>Transactions</div>
                </div>
            </div>

            {/* Quick Links */}
            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Quick Actions</h2>
                <div className={styles.actionGrid}>
                    <Link href="/admin/users" className={styles.actionCard}>
                        <div className={styles.actionIcon}>👥</div>
                        <div className={styles.actionLabel}>Manage Users</div>
                        {stats.bannedUsers > 0 && (
                            <div className={styles.badge}>{stats.bannedUsers} banned</div>
                        )}
                    </Link>

                    <Link href="/admin/listings" className={styles.actionCard}>
                        <div className={styles.actionIcon}>📦</div>
                        <div className={styles.actionLabel}>Moderate Listings</div>
                        {stats.pendingListings > 0 && (
                            <div className={styles.badge}>{stats.pendingListings} pending</div>
                        )}
                    </Link>

                    <Link href="/admin/transactions" className={styles.actionCard}>
                        <div className={styles.actionIcon}>💳</div>
                        <div className={styles.actionLabel}>View Transactions</div>
                    </Link>

                    <Link href="/admin/reports" className={styles.actionCard}>
                        <div className={styles.actionIcon}>🚩</div>
                        <div className={styles.actionLabel}>Review Reports</div>
                    </Link>
                </div>
            </div>

            {/* Recent Listings */}
            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Recent Listings</h2>
                <div className={styles.table}>
                    <table>
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Seller</th>
                                <th>Price</th>
                                <th>Status</th>
                                <th>Moderation</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentListings.map(listing => (
                                <tr key={listing.id}>
                                    <td>
                                        <Link href={`/items/${listing.id}`} className={styles.link}>
                                            {listing.title}
                                        </Link>
                                    </td>
                                    <td>{listing.seller.name}</td>
                                    <td>{listing.price} MAD</td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${styles[listing.status.toLowerCase()]}`}>
                                            {listing.status}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${styles[listing.moderationStatus.toLowerCase()]}`}>
                                            {listing.moderationStatus}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
