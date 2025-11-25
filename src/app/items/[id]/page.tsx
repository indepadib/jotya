import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import ItemPageClient from './ItemPageClient';

export default async function ItemPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const listing = await prisma.listing.findUnique({
        where: { id },
        include: { seller: true },
    });

    if (!listing) {
        notFound();
    }

    // Fetch similar items (same brand, or fallback to recent items for upselling)
    let similarItems = await prisma.listing.findMany({
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

    // Fetch other items from the same seller
    const sellerOtherItems = await prisma.listing.findMany({
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
        />
    );
}
