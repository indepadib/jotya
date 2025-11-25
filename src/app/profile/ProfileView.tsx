'use client';

import { useState } from 'react';
import Link from 'next/link';
import { logout } from '@/app/actions/auth';
import { markAsShipped } from '@/app/actions/fulfillment';
import TopNav from '@/components/Layout/TopNav';
import EditProfileModal from '@/components/Profile/EditProfileModal';
import ChangePasswordModal from '@/components/Profile/ChangePasswordModal';
import VerificationBadge from '@/components/VerificationBadge';
import Icon from '@/components/icons/Icon';
import styles from './profile.module.css';

interface ProfileViewProps {
    user: any; // Type this properly if possible, but any is fine for now to match Prisma return
    stats: {
        totalListings: number;
        totalSales: number;
        totalRevenue: number;
        avgRating: string;
        walletBalance: number;
    };
}

export default function ProfileView({ user, stats }: ProfileViewProps) {
    const [showEditModal, setShowEditModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    return (
        <div className={styles.container}>
            <TopNav title="My Profile" showBack={false} />

            {/* User Header */}
            <div className={styles.header}>
                <div className={styles.avatar}>
                    {user.image ? (
                        <img src={user.image} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        user.name?.charAt(0).toUpperCase() || 'U'
                    )}
                </div>
                <h1 className={styles.name}>{user.name || 'User'}</h1>
                <div className={styles.ratingBadge}>
                    <span className={styles.star}>★</span>
                    <span>{stats.avgRating}</span>
                    <span className={styles.reviewCount}>({user.reviewsReceived.length})</span>
                </div>

                <VerificationBadge
                    phoneVerified={user.phoneVerified}
                    emailVerified={user.emailVerified}
                    idVerified={user.idVerified}
                    topRatedSeller={user.topRatedSeller}
                    size="md"
                />

                <div className={styles.headerActions}>
                    <Link href="/settings" className={styles.iconButton} aria-label="Settings">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </Link>
                </div>
            </div>

            {/* KPI Dashboard */}
            <div className={styles.kpiGrid}>
                <Link href="/wallet" className={styles.kpiBox}>
                    <div className={styles.kpiIcon}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <rect x="1" y="4" width="22" height="16" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M1 10h22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <div className={styles.kpiValue}>{stats.walletBalance.toFixed(0)} MAD</div>
                    <div className={styles.kpiLabel}>Wallet Balance</div>
                </Link>

                <div className={styles.kpiBox}>
                    <div className={styles.kpiIcon}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <div className={styles.kpiValue}>{stats.totalListings}</div>
                    <div className={styles.kpiLabel}>Active Listings</div>
                </div>

                <div className={styles.kpiBox}>
                    <div className={styles.kpiIcon}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M22 4L12 14.01l-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <div className={styles.kpiValue}>{stats.totalSales}</div>
                    <div className={styles.kpiLabel}>Items Sold</div>
                </div>

                <div className={styles.kpiBox}>
                    <div className={styles.kpiIcon}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <div className={styles.kpiValue}>{stats.totalRevenue.toFixed(0)} MAD</div>
                    <div className={styles.kpiLabel}>Total Earnings</div>
                </div>
            </div>

            {/* Analytics Dashboard */}
            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Seller Analytics</h2>
                <div className={styles.analyticsGrid}>
                    <div className={styles.analyticsCard}>
                        <div className={styles.analyticsIcon}>
                            <Icon name="wallet" size={24} strokeWidth={2} />
                        </div>
                        <div className={styles.analyticsValue}>{stats.totalRevenue.toFixed(0)} MAD</div>
                        <div className={styles.analyticsLabel}>Total Revenue</div>
                    </div>

                    <div className={styles.analyticsCard}>
                        <div className={styles.analyticsIcon}>
                            <Icon name="creditCard" size={24} strokeWidth={2} />
                        </div>
                        <div className={styles.analyticsValue}>{user.wallet?.pending?.toFixed(0) || 0} MAD</div>
                        <div className={styles.analyticsLabel}>Pending Balance</div>
                    </div>

                    <div className={styles.analyticsCard}>
                        <div className={styles.analyticsIcon}>
                            <Icon name="box" size={24} strokeWidth={2} />
                        </div>
                        <div className={styles.analyticsValue}>{stats.totalSales}</div>
                        <div className={styles.analyticsLabel}>Total Sales</div>
                    </div>

                    <div className={styles.analyticsCard}>
                        <div className={styles.analyticsIcon}>
                            <Icon name="star" size={24} strokeWidth={2} />
                        </div>
                        <div className={styles.analyticsValue}>{stats.avgRating}</div>
                        <div className={styles.analyticsLabel}>Average Rating</div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Quick Actions</h2>
                <div className={styles.actionGrid}>
                    <Link href="/sell" className={styles.actionCard}>
                        <span className={styles.actionIcon}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </span>
                        <span>List New Item</span>
                    </Link>
                    <Link href="/purchases" className={styles.actionCard}>
                        <span className={styles.actionIcon}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M3 6h18M16 10a4 4 0 01-8 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </span>
                        <span>My Purchases</span>
                    </Link>
                    <Link href="/favorites" className={styles.actionCard}>
                        <span className={styles.actionIcon}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </span>
                        <span>Favorites</span>
                    </Link>
                    <Link href="/inbox" className={styles.actionCard}>
                        <span className={styles.actionIcon}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </span>
                        <span>Messages</span>
                    </Link>
                </div>
            </div>

            {/* My Listings Preview */}
            {stats.totalListings > 0 && (
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>My Listings</h2>
                        <Link href="/my-listings" className={styles.seeAll}>See All →</Link>
                    </div>
                    <div className={styles.listingsPreview}>
                        {user.listings.slice(0, 3).map((listing: any) => {
                            const images = JSON.parse(listing.images);
                            return (
                                <Link key={listing.id} href={`/items/${listing.id}`} className={styles.miniCard}>
                                    <img src={images[0]} alt={listing.title} />
                                    <div className={styles.miniCardInfo}>
                                        <p className={styles.miniCardPrice}>{listing.price} MAD</p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* My Sales (Orders to Ship) */}
            {user.sales && user.sales.length > 0 && (
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>My Sales</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {user.sales.map((sale: any) => (
                            <div key={sale.id} style={{
                                background: 'var(--surface)', padding: 16, borderRadius: 12,
                                border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                            }}>
                                <div>
                                    <div style={{ fontWeight: 600 }}>Order #{sale.id.slice(-6)}</div>
                                    <div style={{ fontSize: '0.9rem', color: '#666' }}>
                                        {sale.amount} MAD • {new Date(sale.createdAt).toLocaleDateString()}
                                    </div>
                                    <div style={{
                                        marginTop: 4, display: 'inline-block', padding: '2px 6px', borderRadius: 4,
                                        fontSize: '0.75rem', fontWeight: 600,
                                        background: sale.status === 'PAID' ? '#fef3c7' : sale.status === 'SHIPPED' ? '#e0f2fe' : '#dcfce7',
                                        color: sale.status === 'PAID' ? '#d97706' : sale.status === 'SHIPPED' ? '#0369a1' : '#166534'
                                    }}>
                                        {sale.status}
                                    </div>
                                </div>

                                {sale.status === 'PAID' && (
                                    <form action={markAsShipped.bind(null, sale.id)}>
                                        <button
                                            type="submit"
                                            style={{
                                                padding: '8px 16px', background: 'var(--primary)', color: 'white',
                                                borderRadius: 8, fontWeight: 600, border: 'none', cursor: 'pointer'
                                            }}
                                        >
                                            Mark Shipped
                                        </button>
                                    </form>
                                )}
                                {sale.status === 'SHIPPED' && (
                                    <div style={{ fontSize: '0.9rem', color: '#666', fontStyle: 'italic' }}>
                                        Waiting for delivery
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Modals */}
            {showEditModal && (
                <EditProfileModal user={user} onClose={() => setShowEditModal(false)} />
            )}
            {showPasswordModal && (
                <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
            )}
        </div>
    );
}
