'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Menu from '@/components/Layout/Menu';
import FloatingAIChat from '@/components/AI/FloatingAIChat';
import styles from "./page.module.css";

interface LandingProps {
    featuredListings: any[];
}

export default function LandingPage({ featuredListings }: LandingProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [stats, setStats] = useState({ items: 0, users: 0, verified: 0 });
    const statsRef = useRef<HTMLDivElement>(null);
    const [hasAnimated, setHasAnimated] = useState(false);

    // Animate stats counters when visible
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !hasAnimated) {
                animateValue('items', 0, 5000);
                animateValue('users', 0, 2500);
                animateValue('verified', 0, 98, true);
                setHasAnimated(true);
            }
        });

        if (statsRef.current) {
            observer.observe(statsRef.current);
        }

        return () => observer.disconnect();
    }, [hasAnimated]);

    const animateValue = (key: keyof typeof stats, start: number, end: number, isPercentage = false) => {
        const duration = 2000;
        const increment = (end - start) / (duration / 16);
        let current = start;

        const timer = setInterval(() => {
            current += increment;
            if (current >= end) {
                current = end;
                clearInterval(timer);
            }
            setStats(prev => ({ ...prev, [key]: Math.floor(current) }));
        }, 16);
    };

    return (
        <>
            <Menu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

            <div className={styles.landing}>
                {/* Hero Section */}
                <section className={styles.hero}>
                    <div className={styles.heroPattern} />
                    <div className={styles.heroContent}>
                        <button className={styles.menuTrigger} onClick={() => setMenuOpen(true)}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="2" />
                            </svg>
                        </button>
                        <h1 className={styles.heroLogo}>Jotya</h1>
                        <p className={styles.heroTagline}>Where Timeless Luxury<br />Meets Moroccan Soul</p>
                        <p className={styles.heroDescription}>
                            Buy and sell authenticated premium fashion, verified by AI
                        </p>
                        <div className={styles.heroCtas}>
                            <Link href="/search" className="btn btn-primary">Explore Now</Link>
                            <Link href="/sell" className="btn btn-secondary">Start Selling</Link>
                        </div>
                    </div>
                </section>

                {/* Ask Jotya AI Section */}
                <section className={styles.aiSection}>
                    <div className={styles.aiPattern} />
                    <div className={styles.aiContent}>
                        <h2 className={styles.aiTitle}>Ask Jotya AI</h2>
                        <p className={styles.aiSubtitle}>Describe what you're looking for in your own words</p>
                        <div className={styles.aiSearchBox}>
                            <div className={styles.aiInputWrapper}>
                                <svg className={styles.aiIcon} width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor" />
                                    <circle cx="12" cy="12" r="1.5" fill="white" />
                                </svg>
                                <textarea
                                    className={styles.aiInput}
                                    placeholder="E.g., 'Show me vintage Gucci bags under 3000 MAD' or 'I need a formal dress for a wedding'"
                                    rows={3}
                                />
                            </div>
                            <button className={styles.aiButton}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Search with AI
                            </button>
                        </div>
                        <div className={styles.aiHint}>
                            <span className={styles.aiHintText}>✨ Try: "red designer handbag" or "Nike shoes size 42"</span>
                        </div>
                    </div>
                </section>

                {/* How It Works */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>How Jotya Works</h2>
                    <div className={styles.steps}>
                        <div className={styles.step}>
                            <div className={styles.stepIcon}>
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                                    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <h3>List Your Item</h3>
                            <p>Upload photos and our AI automatically tags details</p>
                        </div>
                        <div className={styles.step}>
                            <div className={styles.stepIcon}>
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <h3>Get Verified</h3>
                            <p>AI checks authenticity and adds trust badges</p>
                        </div>
                        <div className={styles.step}>
                            <div className={styles.stepIcon}>
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                                    <rect x="1" y="4" width="22" height="16" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M1 10h22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <h3>Earn Safely</h3>
                            <p>Secure payments with instant wallet deposits</p>
                        </div>
                    </div>
                </section>

                {/* Stats */}
                <section ref={statsRef} className={styles.stats}>
                    <div className={styles.stat}>
                        <div className={styles.statValue}>{stats.items.toLocaleString()}+</div>
                        <div className={styles.statLabel}>Items Listed</div>
                    </div>
                    <div className={styles.stat}>
                        <div className={styles.statValue}>{stats.users.toLocaleString()}+</div>
                        <div className={styles.statLabel}>Happy Users</div>
                    </div>
                    <div className={styles.stat}>
                        <div className={styles.statValue}>{stats.verified}%</div>
                        <div className={styles.statLabel}>Verified</div>
                    </div>
                </section>

                {/* Featured Items */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Fresh Arrivals</h2>
                    <div className={styles.grid}>
                        {featuredListings.slice(0, 6).map((listing) => {
                            const images = JSON.parse(listing.images);
                            return (
                                <Link key={listing.id} href={`/items/${listing.id}`} className={styles.card}>
                                    <div className={styles.cardImage}>
                                        <img src={images[0]} alt={listing.title} />
                                    </div>
                                    <div className={styles.cardContent}>
                                        <p className={styles.cardBrand}>{listing.brand}</p>
                                        <p className={styles.cardPrice}>{listing.price} MAD</p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                    <div className={styles.sectionCta}>
                        <Link href="/search" className="btn btn-secondary">View All</Link>
                    </div>
                </section>

                {/* Trust Badges */}
                <section className={styles.trust}>
                    <div className={styles.trustBadge}>
                        <span className={styles.trustIcon}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </span>
                        <h3>AI Verified</h3>
                        <p>Authenticity guaranteed</p>
                    </div>
                    <div className={styles.trustBadge}>
                        <span className={styles.trustIcon}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                                <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </span>
                        <h3>Secure Payments</h3>
                        <p>Protected transactions</p>
                    </div>
                    <div className={styles.trustBadge}>
                        <span className={styles.trustIcon}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </span>
                        <h3>Rated Community</h3>
                        <p>Trusted sellers</p>
                    </div>
                </section>

                {/* CTA Footer */}
                <section className={styles.ctaSection}>
                    <h2 className={styles.ctaTitle}>Ready to Start?</h2>
                    <p className={styles.ctaDescription}>Join thousands of Moroccans buying and selling luxury fashion</p>
                    <Link href="/sell" className="btn btn-primary">List Your First Item</Link>
                </section>
            </div>

            {/* Floating AI Chat Button */}
            <FloatingAIChat />
        </>
    );
}
