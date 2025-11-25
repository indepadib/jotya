'use client';

import { useState } from 'react';
import Link from 'next/link';
import { banUser, unbanUser, makeAdmin, removeAdmin, toggleVerification } from '@/app/actions/admin';
import VerificationBadge from '@/components/VerificationBadge';
import styles from '../admin.module.css';

export default function UserManagementClient({ users }: { users: any[] }) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleBan = async (userId: string, currentlyBanned: boolean) => {
        if (confirm(currentlyBanned ? 'Unban this user?' : 'Ban this user?')) {
            if (currentlyBanned) {
                await unbanUser(userId);
            } else {
                await banUser(userId);
            }
        }
    };

    const handleToggleAdmin = async (userId: string, currentlyAdmin: boolean) => {
        if (confirm(currentlyAdmin ? 'Remove admin privileges?' : 'Make this user an admin?')) {
            if (currentlyAdmin) {
                await removeAdmin(userId);
            } else {
                await makeAdmin(userId);
            }
        }
    };

    const handleToggleVerification = async (userId: string, field: 'phoneVerified' | 'emailVerified' | 'idVerified' | 'topRatedSeller') => {
        await toggleVerification(userId, field);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>User Management</h1>
                <Link href="/admin" className={styles.backBtn}>← Back to Dashboard</Link>
            </div>

            {/* Search */}
            <div style={{ marginBottom: '24px' }}>
                <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '1rem'
                    }}
                />
            </div>

            {/* Users Table */}
            <div className={styles.table}>
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Listings</th>
                            <th>Sales</th>
                            <th>Rating</th>
                            <th>Verification</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.id}>
                                <td>{user.name || 'N/A'}</td>
                                <td>{user.email}</td>
                                <td>{user._count.listings}</td>
                                <td>{user._count.sales}</td>
                                <td>⭐ {user.rating.toFixed(1)}</td>
                                <td>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <button
                                            onClick={() => handleToggleVerification(user.id, 'topRatedSeller')}
                                            style={{
                                                padding: '4px 8px',
                                                background: user.topRatedSeller ? '#ff9800' : 'transparent',
                                                border: '1px solid var(--border)',
                                                borderRadius: '4px',
                                                fontSize: '0.75rem',
                                                cursor: 'pointer',
                                                color: user.topRatedSeller ? 'white' : 'var(--text-secondary)'
                                            }}
                                        >
                                            🏆 Top
                                        </button>
                                        <button
                                            onClick={() => handleToggleVerification(user.id, 'idVerified')}
                                            style={{
                                                padding: '4px 8px',
                                                background: user.idVerified ? '#2196f3' : 'transparent',
                                                border: '1px solid var(--border)',
                                                borderRadius: '4px',
                                                fontSize: '0.75rem',
                                                cursor: 'pointer',
                                                color: user.idVerified ? 'white' : 'var(--text-secondary)'
                                            }}
                                        >
                                            ✓ ID
                                        </button>
                                        <button
                                            onClick={() => handleToggleVerification(user.id, 'phoneVerified')}
                                            style={{
                                                padding: '4px 8px',
                                                background: user.phoneVerified ? '#4caf50' : 'transparent',
                                                border: '1px solid var(--border)',
                                                borderRadius: '4px',
                                                fontSize: '0.75rem',
                                                cursor: 'pointer',
                                                color: user.phoneVerified ? 'white' : 'var(--text-secondary)'
                                            }}
                                        >
                                            📞 Phone
                                        </button>
                                    </div>
                                </td>
                                <td>
                                    {user.isAdmin && (
                                        <span className={`${styles.statusBadge} ${styles.approved}`}>
                                            ADMIN
                                        </span>
                                    )}
                                    {user.banned && (
                                        <span className={`${styles.statusBadge} ${styles.rejected}`}>
                                            BANNED
                                        </span>
                                    )}
                                    {!user.isAdmin && !user.banned && (
                                        <span className={`${styles.statusBadge} ${styles.available}`}>
                                            ACTIVE
                                        </span>
                                    )}
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            onClick={() => handleBan(user.id, user.banned)}
                                            style={{
                                                padding: '6px 12px',
                                                background: user.banned ? 'var(--success)' : 'var(--error)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: 'var(--radius-sm)',
                                                cursor: 'pointer',
                                                fontSize: '0.85rem'
                                            }}
                                        >
                                            {user.banned ? 'Unban' : 'Ban'}
                                        </button>
                                        <button
                                            onClick={() => handleToggleAdmin(user.id, user.isAdmin)}
                                            style={{
                                                padding: '6px 12px',
                                                background: user.isAdmin ? 'var(--text-secondary)' : 'var(--primary)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: 'var(--radius-sm)',
                                                cursor: 'pointer',
                                                fontSize: '0.85rem'
                                            }}
                                        >
                                            {user.isAdmin ? 'Remove Admin' : 'Make Admin'}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div style={{ marginTop: '16px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Showing {filteredUsers.length} of {users.length} users
            </div>
        </div>
    );
}
