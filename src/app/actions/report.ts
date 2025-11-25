'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function reportUser(userId: string, reason: string, description?: string) {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };
    if (session === userId) return { error: 'Cannot report yourself' };

    await prisma.report.create({
        data: {
            reporterId: session,
            reportedId: userId,
            reason,
            description
        }
    });

    return { success: true };
}

export async function reportListing(listingId: string, reason: string, description?: string) {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    const listing = await prisma.listing.findUnique({
        where: { id: listingId },
        select: { sellerId: true }
    });

    if (!listing) return { error: 'Listing not found' };
    if (listing.sellerId === session) return { error: 'Cannot report your own listing' };

    await prisma.report.create({
        data: {
            reporterId: session,
            reportedId: listing.sellerId,
            listingId,
            reason,
            description
        }
    });

    return { success: true };
}

export async function blockUser(userId: string) {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };
    if (session === userId) return { error: 'Cannot block yourself' };

    // Check if already blocked
    const existing = await prisma.blockedUser.findUnique({
        where: {
            blockerId_blockedId: {
                blockerId: session,
                blockedId: userId
            }
        }
    });

    if (existing) return { error: 'User already blocked' };

    await prisma.blockedUser.create({
        data: {
            blockerId: session,
            blockedId: userId
        }
    });

    revalidatePath('/');
    return { success: true };
}

export async function unblockUser(userId: string) {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    await prisma.blockedUser.deleteMany({
        where: {
            blockerId: session,
            blockedId: userId
        }
    });

    revalidatePath('/');
    return { success: true };
}

export async function getBlockedUsers() {
    const session = await getSession();
    if (!session) return [];

    const blocked = await prisma.blockedUser.findMany({
        where: { blockerId: session },
        include: {
            blocked: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true
                }
            }
        }
    });

    return blocked;
}
