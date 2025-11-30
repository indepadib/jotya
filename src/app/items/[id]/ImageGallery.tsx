'use client';

import { useState, useRef } from 'react';
import styles from './item.module.css';

interface ImageGalleryProps {
    images: string[];
    title: string;
}

export default function ImageGallery({ images, title }: ImageGalleryProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [isZoomed, setIsZoomed] = useState(false);
    const galleryRef = useRef<HTMLDivElement>(null);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const container = e.currentTarget;
        const scrollPosition = container.scrollLeft;
        const imageWidth = container.offsetWidth;
        const newIndex = Math.round(scrollPosition / imageWidth);
        setCurrentImageIndex(newIndex);
    };

    const scrollToImage = (index: number) => {
        if (galleryRef.current) {
            const imageWidth = galleryRef.current.offsetWidth;
            galleryRef.current.scrollTo({
                left: index * imageWidth,
                behavior: 'smooth'
            });
        }
    };

    const handlePrevious = () => {
        const newIndex = currentImageIndex > 0 ? currentImageIndex - 1 : images.length - 1;
        scrollToImage(newIndex);
    };

    const handleNext = () => {
        const newIndex = currentImageIndex < images.length - 1 ? currentImageIndex + 1 : 0;
        scrollToImage(newIndex);
    };

    const openLightbox = (index: number) => {
        setCurrentImageIndex(index);
        setIsLightboxOpen(true);
        setIsZoomed(false);
        document.body.style.overflow = 'hidden'; // Prevent background scroll
    };

    const closeLightbox = () => {
        setIsLightboxOpen(false);
        setIsZoomed(false);
        document.body.style.overflow = ''; // Restore scroll
    };

    const toggleZoom = () => {
        setIsZoomed(!isZoomed);
    };

    const lightboxPrevious = () => {
        setCurrentImageIndex(currentImageIndex > 0 ? currentImageIndex - 1 : images.length - 1);
        setIsZoomed(false);
    };

    const lightboxNext = () => {
        setCurrentImageIndex(currentImageIndex < images.length - 1 ? currentImageIndex + 1 : 0);
        setIsZoomed(false);
    };

    return (
        <>
            <div className={styles.galleryWrapper}>
                <div className={styles.imageGallery} onScroll={handleScroll} ref={galleryRef}>
                    {images.map((src: string, index: number) => (
                        <img
                            key={index}
                            src={src}
                            alt={`${title} - ${index + 1}`}
                            className={styles.galleryImage}
                            onClick={() => openLightbox(index)}
                            style={{ cursor: 'pointer' }}
                        />
                    ))}
                </div>

                {/* Navigation Arrows for Desktop */}
                {images.length > 1 && (
                    <>
                        <button
                            className={`${styles.navArrow} ${styles.navArrowLeft}`}
                            onClick={handlePrevious}
                            aria-label="Previous image"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                        <button
                            className={`${styles.navArrow} ${styles.navArrowRight}`}
                            onClick={handleNext}
                            aria-label="Next image"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </>
                )}

                {/* Position Indicators */}
                {images.length > 1 && (
                    <div className={styles.indicators}>
                        {images.map((_, index: number) => (
                            <button
                                key={index}
                                className={`${styles.indicator} ${index === currentImageIndex ? styles.indicatorActive : ''
                                    }`}
                                onClick={() => scrollToImage(index)}
                                aria-label={`View image ${index + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Lightbox Modal */}
            {isLightboxOpen && (
                <div className={styles.lightboxOverlay} onClick={closeLightbox}>
                    <button className={styles.closeButton} onClick={closeLightbox} aria-label="Close">
                        ✕
                    </button>

                    <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
                        <img
                            src={images[currentImageIndex]}
                            alt={`${title} - ${currentImageIndex + 1}`}
                            className={`${styles.lightboxImage} ${isZoomed ? styles.zoomed : ''}`}
                            onClick={toggleZoom}
                        />

                        {images.length > 1 && (
                            <>
                                <button
                                    className={`${styles.lightboxNav} ${styles.lightboxNavLeft}`}
                                    onClick={lightboxPrevious}
                                    aria-label="Previous image"
                                >
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>
                                <button
                                    className={`${styles.lightboxNav} ${styles.lightboxNavRight}`}
                                    onClick={lightboxNext}
                                    aria-label="Next image"
                                >
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
