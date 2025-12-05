'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { toggleFavorite } from '@/app/actions/favorite';

interface ProductCardProps {
    id: string;
    title: string;
    price: number;
    image: string;
    brand?: string;
    isFavorited?: boolean;
}

export default function ProductCard({ id, title, price, image, brand, isFavorited = false }: ProductCardProps) {
    const [isLiked, setIsLiked] = useState(isFavorited);

    const handleLike = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsLiked(!isLiked); // Optimistic update
        try {
            const result = await toggleFavorite(id);
            if (result.error) setIsLiked(isLiked); // Revert on error
        } catch (err) {
            setIsLiked(isLiked);
        }
    };

    return (
        <Link
            href={`/items/${id}`}
            style={{
                display: 'block',
                textDecoration: 'none',
                color: 'inherit',
                background: 'var(--background)',
                borderRadius: '16px', // More rounded
                overflow: 'hidden',
                border: '1px solid var(--border)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                position: 'relative',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)' // Subtle shadow
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
            }}
        >
            <button
                onClick={handleLike}
                style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    zIndex: 10,
                    background: 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(4px)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    transition: 'transform 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill={isLiked ? "#FF4081" : "none"} stroke={isLiked ? "#FF4081" : "#1e293b"} strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                </svg>
            </button>
            <div style={{ position: 'relative', paddingTop: '133%' /* 4:3 Aspect Ratio */ }}>
                <Image
                    src={image}
                    alt={title}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    style={{
                        objectFit: 'cover'
                    }}
                    loading="lazy"
                />
            </div>
            <div style={{ padding: '16px' }}>
                <div style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '4px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    fontWeight: 500
                }}>
                    {brand || 'Unknown Brand'}
                </div>
                <div style={{
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: '8px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                }}>
                    {title}
                </div>
                <div style={{
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    color: 'var(--primary)'
                }}>
                    {price} MAD
                </div>
            </div>
        </Link>
    );
}
