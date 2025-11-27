'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getUnreadMessageCount } from '@/app/actions/notifications';
import NotificationBadge from '@/components/NotificationBadge';
import styles from './BottomNav.module.css';

export default function BottomNav() {
    const pathname = usePathname();
    const [unreadCount, setUnreadCount] = useState(0);

    // Fetch unread count on mount and when pathname changes
    useEffect(() => {
        const fetchUnreadCount = async () => {
            const count = await getUnreadMessageCount();
            setUnreadCount(count);
        };
        fetchUnreadCount();

        // Refresh every 30 seconds
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, [pathname]);

    // Hide bottom nav on chat detail pages to make room for the input area
    // Matches /inbox/xyz but not /inbox
    if (pathname?.startsWith('/inbox/') && pathname !== '/inbox') {
        return null;
    }

    return (
        <nav className={styles.nav}>
            <Link href="/" className={`${styles.link} ${pathname === '/' ? styles.active : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                <span className={styles.label}>Home</span>
            </Link>
            <Link href="/discover" className={`${styles.link} ${pathname === '/discover' ? styles.active : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
                <span className={styles.label}>Discover</span>
            </Link>
            <Link href="/sell" className={styles.sellLink}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
            </Link>
            <Link href="/inbox" className={`${styles.link} ${pathname === '/inbox' ? styles.active : ''}`} style={{ position: 'relative' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                <span className={styles.label}>Inbox</span>
                <NotificationBadge count={unreadCount} />
            </Link>
            <Link href="/profile" className={`${styles.link} ${pathname?.startsWith('/profile') ? styles.active : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                <span className={styles.label}>Profile</span>
            </Link>
        </nav>
    );
}
