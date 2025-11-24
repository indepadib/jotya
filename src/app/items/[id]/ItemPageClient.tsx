'use client';

import { useState } from 'react';
import { startConversation } from '@/app/actions/chat';
import { deleteListing } from '@/app/actions/listing';
import { createOffer } from '@/app/actions/offer';
import styles from './item.module.css';
import Link from 'next/link';
import ImageGallery from './ImageGallery';
import ExpandableDescription from './ExpandableDescription';
import TopNav from '@/components/Layout/TopNav';
import Menu from '@/components/Layout/Menu';
import OfferModal from '@/components/OfferModal';

interface Listing {
    id: string;
    title: string;
    price: number;
    images: string;
    brand: string | null;
    size: string | null;
    color: string | null;
    condition: string;
    description: string;
    verified: boolean;
    sellerId: string;
    seller: {
        id: string;
        name: string;
        rating: number;
        createdAt: Date;
    };
}

interface ItemPageClientProps {
    listing: Listing;
    similarItems: Listing[];
    sellerOtherItems: Listing[];
    memberSince: number;
    images: string[];
    currentUserId?: string;
}

export default function ItemPageClient({
    listing,
    similarItems,
    sellerOtherItems,
    memberSince,
    images,
    currentUserId
}: ItemPageClientProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showOfferModal, setShowOfferModal] = useState(false);

    const isOwner = currentUserId === listing.sellerId;

    const handleOfferSubmit = async (amount: number) => {
        await createOffer(listing.id, amount);
    };

    return (
        <>
            <TopNav showBack={true} showMenu={true} onMenuClick={() => setIsMenuOpen(true)} />
            <Menu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

            <div className={styles.container}>
                {/* Hero Image Gallery - Client Component for Interactivity */}
                <ImageGallery images={images} title={listing.title} />

                {/* Content Section */}
                <div className={styles.content}>
                    {/* Price Hero */}
                    <div className={styles.priceHero}>
                        <div className={styles.brandRow}>
                            <span className={styles.brandName}>{listing.brand || 'Brand'}</span>
                            {listing.verified && (
                                <span className={styles.verifiedBadge} title="AI Verified Authentic">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className={styles.badgeIcon}>
                                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    Verified
                                </span>
                            )}
                        </div>
                        <h1 className={styles.title}>{listing.title}</h1>
                        <p className={styles.price}>{listing.price} MAD</p>
                    </div>

                    {/* Info Chips Grid */}
                    <div className={styles.infoGrid}>
                        <div className={styles.infoChip}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={styles.chipIcon}>
                                <path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <div className={styles.chipContent}>
                                <span className={styles.chipLabel}>Brand</span>
                                <span className={styles.chipValue}>{listing.brand || 'N/A'}</span>
                            </div>
                        </div>
                        <div className={styles.infoChip}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={styles.chipIcon}>
                                <path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <div className={styles.chipContent}>
                                <span className={styles.chipLabel}>Size</span>
                                <span className={styles.chipValue}>{listing.size || 'N/A'}</span>
                            </div>
                        </div>
                        <div className={styles.infoChip}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={styles.chipIcon}>
                                <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <div className={styles.chipContent}>
                                <span className={styles.chipLabel}>Condition</span>
                                <span className={styles.chipValue}>{listing.condition}</span>
                            </div>
                        </div>
                        <div className={styles.infoChip}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={styles.chipIcon}>
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                <circle cx="12" cy="12" r="3" fill="currentColor" />
                            </svg>
                            <div className={styles.chipContent}>
                                <span className={styles.chipLabel}>Color</span>
                                <span className={styles.chipValue}>{listing.color || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Expandable Description - Client Component for Interactivity */}
                    <ExpandableDescription description={listing.description} />

                    {/* Enhanced Seller Card */}
                    <div className={styles.sellerSection}>
                        <h3 className={styles.sectionTitle}>Seller Information</h3>
                        <div className={styles.sellerCard}>
                            <div className={styles.sellerAvatar}>
                                {listing.seller.name ? listing.seller.name[0].toUpperCase() : 'U'}
                            </div>
                            <div className={styles.sellerInfo}>
                                <span className={styles.sellerName}>{listing.seller.name}</span>
                                <div className={styles.sellerMeta}>
                                    <span className={styles.sellerRating}>
                                        ★ {listing.seller.rating.toFixed(1)}
                                    </span>
                                    <span className={styles.sellerSince}>Member since {memberSince}</span>
                                </div>
                            </div>
                            <Link href={`/profile/${listing.sellerId}`} className={styles.viewProfileBtn}>
                                View Profile →
                            </Link>
                        </div>
                    </div>

                    {/* Other Items from Seller */}
                    {sellerOtherItems.length > 0 && (
                        <div className={styles.sellerItemsSection}>
                            <h3 className={styles.sectionTitle}>More from this Seller</h3>
                            <div className={styles.itemsCarousel}>
                                {sellerOtherItems.map((item) => {
                                    const itemImages = JSON.parse(item.images as string);
                                    return (
                                        <Link
                                            key={item.id}
                                            href={`/items/${item.id}`}
                                            className={styles.itemCard}
                                        >
                                            <img
                                                src={itemImages[0]}
                                                alt={item.title}
                                                className={styles.itemImage}
                                            />
                                            <div className={styles.itemInfo}>
                                                <p className={styles.itemTitle}>{item.title}</p>
                                                <p className={styles.itemPrice}>{item.price} MAD</p>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Similar Items Carousel - You May Also Like for Upselling */}
                    {similarItems.length > 0 && (
                        <div className={styles.similarSection}>
                            <h3 className={styles.sectionTitle}>You May Also Like</h3>
                            <div className={styles.itemsCarousel}>
                                {similarItems.map((item) => {
                                    const itemImages = JSON.parse(item.images as string);
                                    return (
                                        <Link
                                            key={item.id}
                                            href={`/items/${item.id}`}
                                            className={styles.itemCard}
                                        >
                                            <img
                                                src={itemImages[0]}
                                                alt={item.title}
                                                className={styles.itemImage}
                                            />
                                            <div className={styles.itemInfo}>
                                                <p className={styles.itemTitle}>{item.title}</p>
                                                <p className={styles.itemPrice}>{item.price} MAD</p>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sticky CTA Bar */}
                <div className={styles.stickyActions}>
                    {isOwner ? (
                        <>
                            <Link href={`/items/${listing.id}/edit`} className={styles.editBtn} style={{ flex: 1, textAlign: 'center', padding: '12px', background: '#f3f4f6', borderRadius: '12px', fontWeight: 600, color: '#374151', marginRight: '8px' }}>
                                Edit Item
                            </Link>
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className={styles.deleteBtn}
                                style={{ flex: 1, padding: '12px', background: '#fee2e2', borderRadius: '12px', fontWeight: 600, color: '#ef4444', border: 'none' }}
                            >
                                Delete
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => setShowOfferModal(true)}
                                className={styles.messageBtn}
                                style={{ background: '#f1f3f5', color: '#000', border: 'none' }}
                            >
                                Make Offer
                            </button>
                            <form action={startConversation} className={styles.messageForm}>
                                <input type="hidden" name="listingId" value={listing.id} />
                                <input type="hidden" name="sellerId" value={listing.sellerId} />
                                <button type="submit" className={styles.messageBtn}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                        <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    Message
                                </button>
                            </form>
                            <Link href={`/checkout/${listing.id}`} className={styles.buyBtn}>
                                Buy Now
                            </Link>
                        </>
                    )}
                </div>
            </div>

            {/* Offer Modal */}
            <OfferModal
                isOpen={showOfferModal}
                onClose={() => setShowOfferModal(false)}
                onSubmit={handleOfferSubmit}
                currentPrice={listing.price}
                listingTitle={listing.title}
                listingImage={images[0]}
            />

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{ background: 'white', padding: '24px', borderRadius: '16px', width: '90%', maxWidth: '320px', textAlign: 'center' }}>
                        <h3 style={{ marginBottom: '12px', fontSize: '1.2rem' }}>Delete Item?</h3>
                        <p style={{ marginBottom: '24px', color: '#6b7280' }}>This action cannot be undone.</p>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb', background: 'white', fontWeight: 600 }}
                            >
                                Cancel
                            </button>
                            <form action={async () => { await deleteListing(listing.id); }} style={{ flex: 1 }}>
                                <button
                                    type="submit"
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', background: '#ef4444', color: 'white', fontWeight: 600 }}
                                >
                                    Delete
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
