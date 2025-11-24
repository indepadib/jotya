'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export interface SearchFilters {
    query?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    condition?: string;
    size?: string;
    gender?: string;
    category?: string;
    itemType?: string;
    subtype?: string;
}

export async function searchListings(filters: SearchFilters) {
    const session = await getSession();

    const where: any = {
        status: 'AVAILABLE',
    };

    if (filters.query) {
        where.OR = [
            { title: { contains: filters.query } },
            { description: { contains: filters.query } },
            { brand: { contains: filters.query } }
        ];
    }

    if (filters.gender && filters.gender !== 'all') where.gender = filters.gender;
    if (filters.category && filters.category !== 'all') where.category = filters.category;
    if (filters.itemType && filters.itemType !== 'all') where.itemType = filters.itemType;
    if (filters.subtype && filters.subtype !== 'all') where.subtype = filters.subtype;

    if (filters.brand) {
        where.brand = { contains: filters.brand };
    }

    if (filters.condition) {
        where.condition = filters.condition;
    }

    if (filters.size) {
        where.size = filters.size;
    }

    if (filters.minPrice || filters.maxPrice) {
        where.price = {};
        if (filters.minPrice) where.price.gte = filters.minPrice;
        if (filters.maxPrice) where.price.lte = filters.maxPrice;
    }

    const listings = await prisma.listing.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
            seller: { select: { name: true, rating: true } },
            // favoritedBy: session ? { where: { userId: session } } : false
        }
    });

    // Transform to include isFavorited boolean
    return listings.map(listing => ({
        ...listing,
        isFavorited: false // session ? listing.favoritedBy.length > 0 : false
    }));
}

export async function toggleFavorite(listingId: string) {
    const session = await getSession();
    if (!session) throw new Error('Unauthorized');

    const existing = await prisma.favorite.findUnique({
        where: {
            userId_listingId: {
                userId: session,
                listingId
            }
        }
    });

    if (existing) {
        await prisma.favorite.delete({
            where: { id: existing.id }
        });
    } else {
        await prisma.favorite.create({
            data: {
                userId: session,
                listingId
            }
        });
    }

    revalidatePath('/search');
    revalidatePath(`/items/${listingId}`);
    revalidatePath('/profile');
}

export async function getFavorites() {
    const session = await getSession();
    if (!session) return [];

    const favorites = await prisma.favorite.findMany({
        where: { userId: session },
        include: {
            listing: {
                include: { seller: true }
            }
        }
    });

    return favorites.map(f => f.listing);
}
