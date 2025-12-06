import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import ItemPageClient from './ItemPageClient';
import { Suspense } from 'react';
import ItemDetailSkeleton from '@/components/Skeleton/ItemDetailSkeleton';
import type { Metadata } from 'next';

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;

    try {
        const listing = await prisma.listing.findUnique({
            where: { id },
            select: {
                title: true,
                description: true,
                price: true,
                images: true,
                brand: true,
                condition: true,
                verified: true,
            }
        });

        if (!listing) {
            return {
                title: 'Item Not Found | Jotya',
                description: 'This item is no longer available'
            };
        }

        const images = JSON.parse(listing.images as string);
        const firstImage = images[0] || '/images/jotya-logo.jpg';

        return {
            title: `${listing.title} - ${listing.price} MAD | Jotya`,
            description: listing.description || `Buy ${listing.title} for ${listing.price} MAD on Jotya. ${listing.verified ? 'AI-verified authentic.' : ''} Quality: ${listing.condition}.`,
            keywords: ['jotya', 'morocco', 'second-hand', 'luxury', 'fashion', listing.brand || '', listing.title],
            openGraph: {
                title: listing.title,
                description: listing.description || `${listing.title} - ${listing.price} MAD`,
                images: [
                    {
                        url: firstImage,
                        width: 800,
                        height: 600,
                        alt: listing.title,
                    }
                ],
                type: 'website',
                siteName: 'Jotya',
            },
            twitter: {
                card: 'summary_large_image',
                title: listing.title,
                description: listing.description || `${listing.title} - ${listing.price} MAD`,
                images: [firstImage],
            },
        };
    } catch (error) {
        return {
            title: 'Item | Jotya',
            description: 'Premium second-hand marketplace in Morocco'
        };
    }
}

async function ItemPageContent({ id }: { id: string }) {
    // Execute queries in parallel for better performance
    const [listing, brandLookup, colorLookup, sizeLookup] = await Promise.all([
        prisma.listing.findUnique({
            where: { id },
            include: {
                seller: true,
                brandRef: true,
                colorRef: true,
                sizeRef: true
            },
        }),
        // These will be null if not needed, optimized later
        Promise.resolve(null),
        Promise.resolve(null),
        Promise.resolve(null)
    ]);

    if (!listing) {
        notFound();
    }

    // Helper to check if value is a database ID
    const isDatabaseId = (value: string | null): boolean => {
        if (!value) return false;
        return value.length === 25 && /^c[a-z0-9]{24}$/i.test(value);
    };

    // Lookup additional brand/color/size if needed (in parallel)
    const lookupPromises = [];
    if (listing.brand && isDatabaseId(listing.brand)) {
        lookupPromises.push(
            prisma.brand.findUnique({ where: { id: listing.brand } }).then(b => ({ type: 'brand', data: b }))
        );
    }
    if (listing.color && isDatabaseId(listing.color)) {
        lookupPromises.push(
            prisma.color.findUnique({ where: { id: listing.color } }).then(c => ({ type: 'color', data: c }))
        );
    }
    if (listing.size && isDatabaseId(listing.size)) {
        lookupPromises.push(
            prisma.size.findUnique({ where: { id: listing.size } }).then(s => ({ type: 'size', data: s }))
        );
    }

    const lookups = await Promise.all(lookupPromises);
    let finalBrandLookup = null;
    let finalColorLookup = null;
    let finalSizeLookup = null;

    lookups.forEach(lookup => {
        if (lookup.type === 'brand') finalBrandLookup = lookup.data;
        if (lookup.type === 'color') finalColorLookup = lookup.data;
        if (lookup.type === 'size') finalSizeLookup = lookup.data;
    });

    // Fetch similar items and seller items in parallel
    let [similarItems, sellerOtherItems] = await Promise.all([
        prisma.listing.findMany({
            where: {
                AND: [
                    { id: { not: id } },
                    { status: 'AVAILABLE' },
                    { brand: listing.brand },
                ],
            },
            take: 6,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                title: true,
                price: true,
                images: true,
                brand: true,
                size: true,
                color: true,
                condition: true,
                verified: true,
                sellerId: true,
                status: true,
                seller: {
                    select: {
                        id: true,
                        name: true,
                        rating: true,
                        createdAt: true,
                        phoneVerified: true,
                        emailVerified: true,
                        idVerified: true,
                        topRatedSeller: true,
                    }
                }
            }
        }),
        prisma.listing.findMany({
            where: {
                AND: [
                    { sellerId: listing.sellerId },
                    { id: { not: id } },
                    { status: 'AVAILABLE' },
                ],
            },
            take: 6,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                title: true,
                price: true,
                images: true,
                brand: true,
                size: true,
                color: true,
                condition: true,
                verified: true,
                sellerId: true,
                status: true,
                seller: {
                    select: {
                        id: true,
                        name: true,
                        rating: true,
                        createdAt: true,
                        phoneVerified: true,
                        emailVerified: true,
                        idVerified: true,
                        topRatedSeller: true,
                    }
                }
            }
        })
    ]);

    // If no items with same brand, fetch any recent available items for upselling
    if (similarItems.length === 0) {
        similarItems = await prisma.listing.findMany({
            where: {
                AND: [
                    { id: { not: id } },
                    { status: 'AVAILABLE' },
                ],
            },
            take: 6,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                title: true,
                price: true,
                images: true,
                brand: true,
                size: true,
                color: true,
                condition: true,
                verified: true,
                sellerId: true,
                status: true,
                seller: {
                    select: {
                        id: true,
                        name: true,
                        rating: true,
                        createdAt: true,
                        phoneVerified: true,
                        emailVerified: true,
                        idVerified: true,
                        topRatedSeller: true,
                    }
                }
            }
        });
    }

    const images = JSON.parse(listing.images as string);
    const memberSince = new Date(listing.seller.createdAt).getFullYear();

    // Get current user session
    const { cookies } = await import('next/headers');
    const session = (await cookies()).get('session')?.value;

    return (
        <ItemPageClient
            listing={{
                ...listing,
                seller: {
                    ...listing.seller,
                    name: listing.seller.name || 'User'
                }
            }}
            similarItems={similarItems as any}
            sellerOtherItems={sellerOtherItems as any}
            memberSince={memberSince}
            images={images}
            currentUserId={session}
            brandLookup={finalBrandLookup}
            colorLookup={finalColorLookup}
            sizeLookup={finalSizeLookup}
        />
    );
}

export default async function ItemPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    return (
        <Suspense fallback={<ItemDetailSkeleton />}>
            <ItemPageContent id={id} />
        </Suspense>
    );
}
