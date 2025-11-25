'use client';

import { useState } from 'react';
import Link from 'next/link';
import { approveListing, rejectListing, flagListing } from '@/app/actions/admin';
import styles from '../admin.module.css';

export default function ListingModerationClient({ listings }: { listings: any[] }) {
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredListings = listings.filter(listing => {
        const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            listing.seller.name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterStatus === 'ALL' || listing.moderationStatus === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const handleAction = async (listingId: string, action: 'approve' | 'reject' | 'flag') => {
        if (action === 'approve') await approveListing(listingId);
        if (action === 'reject') await rejectListing(listingId);
        if (action === 'flag') await flagListing(listingId);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Listing Moderation</h1>
                <Link href="/admin" className={styles.backBtn}>← Back to Dashboard</Link>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                <input
                    type="text"
                    placeholder="Search listings..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                        flex: 1,
                        padding: '12px 16px',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '1rem'
                    }}
                />
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    style={{
                        padding: '12px 16px',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '1rem',
                        background: 'var(--surface)'
                    }}
                >
                    <option value="ALL">All Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="FLAGGED">Flagged</option>
                </select>
            </div>

            {/* Listings Table */}
            <div className={styles.table}>
                <table>
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Seller</th>
                            <th>Price</th>
                            <th>Status</th>
                            <th>Moderation</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredListings.map(listing => (
                            <tr key={listing.id}>
                                <td>
                                    <Link href={`/items/${listing.id}`} className={styles.link} target="_blank">
                                        {listing.title}
                                    </Link>
                                </td>
                                <td>
                                    {listing.seller.name || 'N/A'}
                                    <br />
                                    <small style={{ color: 'var(--text-secondary)' }}>
                                        ⭐ {listing.seller.rating.toFixed(1)}
                                    </small>
                                </td>
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
                                <td>
                                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                        {listing.moderationStatus !== 'APPROVED' && (
                                            <button
                                                onClick={() => handleAction(listing.id, 'approve')}
                                                style={{
                                                    padding: '4px 8px',
                                                    background: '#4caf50',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: 'var(--radius-sm)',
                                                    cursor: 'pointer',
                                                    fontSize: '0.8rem'
                                                }}
                                            >
                                                ✓ Approve
                                            </button>
                                        )}
                                        {listing.moderationStatus !== 'REJECTED' && (
                                            <button
                                                onClick={() => handleAction(listing.id, 'reject')}
                                                style={{
                                                    padding: '4px 8px',
                                                    background: '#f44336',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: 'var(--radius-sm)',
                                                    cursor: 'pointer',
                                                    fontSize: '0.8rem'
                                                }}
                                            >
                                                ✗ Reject
                                            </button>
                                        )}
                                        {listing.moderationStatus !== 'FLAGGED' && (
                                            <button
                                                onClick={() => handleAction(listing.id, 'flag')}
                                                style={{
                                                    padding: '4px 8px',
                                                    background: '#ff9800',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: 'var(--radius-sm)',
                                                    cursor: 'pointer',
                                                    fontSize: '0.8rem'
                                                }}
                                            >
                                                🚩 Flag
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div style={{ marginTop: '16px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Showing {filteredListings.length} of {listings.length} listings
            </div>
        </div>
    );
}
