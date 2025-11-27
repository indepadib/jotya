'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getUnreadMessageCount } from '@/app/actions/notifications';
import NotificationBadge from '@/components/NotificationBadge';
import styles from './DesktopHeader.module.css';

export default function DesktopHeader() {
    const [profileOpen, setProfileOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();

    // Fetch unread count
    useEffect(() => {
        const fetchUnreadCount = async () => {
            const count = await getUnreadMessageCount();
            setUnreadCount(count);
        };
        fetchUnreadCount();

        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, [pathname]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setProfileOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                {/* Logo */}
                <Link href="/" className={styles.logo}>
                    Jotya
                </Link>

                {/* Navigation Links */}
                <nav className={styles.nav}>
                    <Link href="/discover" className={pathname === '/discover' ? styles.active : ''}>
                        🔥 Discover
                    </Link>
                    <Link href="/search" className={pathname === '/search' ? styles.active : ''}>
                        Search
                    </Link>
                    <Link href="/sell" className={`${styles.sellBtn} ${pathname === '/sell' ? styles.active : ''}`}>
                        + Sell
                    </Link>
                </nav>

                {/* User Menu */}
                <div className={styles.userMenu} ref={dropdownRef}>
                    <button
                        className={styles.profileBtn}
                        onClick={() => setProfileOpen(!profileOpen)}
                        aria-label="User menu"
                        style={{ position: 'relative' }}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <NotificationBadge count={unreadCount} />
                    </button>

                    {profileOpen && (
                        <div className={styles.dropdown}>
                            <Link href="/profile" onClick={() => setProfileOpen(false)}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" />
                                    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
                                </svg>
                                My Profile
                            </Link>
                            <Link href="/purchases" onClick={() => setProfileOpen(false)}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="currentColor" strokeWidth="2" />
                                </svg>
                                My Purchases
                            </Link>
                            <Link href="/favorites" onClick={() => setProfileOpen(false)}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke="currentColor" strokeWidth="2" />
                                </svg>
                                Favorites
                            </Link>
                            <Link href="/wallet" onClick={() => setProfileOpen(false)}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                    <rect x="1" y="4" width="22" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
                                    <path d="M1 10h22" stroke="currentColor" strokeWidth="2" />
                                </svg>
                                Wallet
                            </Link>
                            <Link href="/inbox" onClick={() => setProfileOpen(false)} style={{ position: 'relative' }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" strokeWidth="2" />
                                </svg>
                                Messages
                                <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }}>
                                    {unreadCount > 0 && (
                                        <span style={{
                                            background: '#f44336',
                                            color: 'white',
                                            fontSize: '11px',
                                            fontWeight: 'bold',
                                            padding: '2px 6px',
                                            borderRadius: '10px'
                                        }}>
                                            {unreadCount}
                                        </span>
                                    )}
                                </div>
                            </Link>
                            <Link href="/settings" onClick={() => setProfileOpen(false)}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                                    <path d="M12 1v6m0 6v6M1 12h6m6 0h6" stroke="currentColor" strokeWidth="2" />
                                </svg>
                                Settings
                            </Link>
                            <div className={styles.divider} />
                            <button className={styles.logoutBtn}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" />
                                </svg>
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
