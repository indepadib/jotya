'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './TopNav.module.css';

interface TopNavProps {
    title?: string;
    showBack?: boolean;
    showMenu?: boolean;
    onMenuClick?: () => void;
}

export default function TopNav({
    title,
    showBack = true,
    showMenu = true,
    onMenuClick
}: TopNavProps) {
    const router = useRouter();

    return (
        <nav className={styles.nav}>
            <div className={styles.left}>
                {showBack && (
                    <button
                        onClick={() => router.back()}
                        className={styles.backButton}
                        aria-label="Go back"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M15 18l-6-6 6-6"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </button>
                )}
            </div>

            <div className={styles.center}>
                {title ? (
                    <h1 className={styles.title}>{title}</h1>
                ) : (
                    <Link href="/" className={styles.logo}>Jotya</Link>
                )}
            </div>

            <div className={styles.right}>
                {showMenu && (
                    <button
                        onClick={onMenuClick}
                        className={styles.menuButton}
                        aria-label="Open menu"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </button>
                )}
            </div>
        </nav>
    );
}
