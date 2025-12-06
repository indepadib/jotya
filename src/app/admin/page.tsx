import { requireAdmin } from '@/lib/adminAuth';
import { getPlatformStats } from '@/app/actions/admin';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import Icon from '@/components/icons/Icon';
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
                        <Icon name="users" className={styles.iconSvg} strokeWidth={2} />
                    </div>
                    <div className={styles.statValue}>{stats.totalUsers}</div>
                    <div className={styles.statLabel}>Total Users</div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: '#fff3e0' }}>
                        <Icon name="box" className={styles.iconSvg} strokeWidth={2} />
                    </div>
                    <div className={styles.statValue}>{stats.totalListings}</div>
                    <div className={styles.statLabel}>Total Listings</div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: '#e8f5e9' }}>
                        <Icon name="wallet" className={styles.iconSvg} strokeWidth={2} />
                    </div>
                    <div className={styles.statValue}>{stats.totalRevenue.toFixed(0)} MAD</div>
                    <div className={styles.statLabel}>Total Revenue</div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: '#fce4ec' }}>
                        <Icon name="creditCard" className={styles.iconSvg} strokeWidth={2} />
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
                        <div className={styles.actionIcon}>
                            <Icon name="users" size={32} strokeWidth={1.5} />
                        </div>
                        <div className={styles.actionLabel}>Manage Users</div>
                        {stats.bannedUsers > 0 && (
                            <div className={styles.badge}>{stats.bannedUsers} banned</div>
                        )}
                    </Link>

                    <Link href="/admin/listings" className={styles.actionCard}>
                        <div className={styles.actionIcon}>
                            <Icon name="box" size={32} strokeWidth={1.5} />
                        </div>
                        <div className={styles.actionLabel}>Moderate Listings</div>
                        {stats.pendingListings > 0 && (
                            <div className={styles.badge}>{stats.pendingListings} pending</div>
                        )}
                    </Link>

                    <Link href="/admin/transactions" className={styles.actionCard}>
                        <div className={styles.actionIcon}>
                            <Icon name="creditCard" size={32} strokeWidth={1.5} />
                        </div>
                        <div className={styles.actionLabel}>View Transactions</div>
                    </Link>

                    <Link href="/admin/reports" className={styles.actionCard}>
                        <div className={styles.actionIcon}>
                            <Icon name="flag" size={32} strokeWidth={1.5} />
                        </div>
                        <div className={styles.actionLabel}>Review Reports</div>
                    </Link>

                    <Link href="/admin/analytics" className={styles.actionCard}>
                        <div className={styles.actionIcon}>
                            <Icon name="barChart" size={32} strokeWidth={1.5} />
                        </div>
                        <div className={styles.actionLabel}>Analytics Dashboard</div>
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
