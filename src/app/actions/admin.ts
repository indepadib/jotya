'use server';

import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';
import { revalidatePath } from 'next/cache';

// User Management Actions
export async function banUser(userId: string) {
    await requireAdmin();

    await prisma.user.update({
        where: { id: userId },
        data: { banned: true }
    });

    revalidatePath('/admin/users');
    return { success: true };
}

export async function unbanUser(userId: string) {
    await requireAdmin();

    await prisma.user.update({
        where: { id: userId },
        data: { banned: false }
    });

    revalidatePath('/admin/users');
    return { success: true };
}

export async function makeAdmin(userId: string) {
    await requireAdmin();

    await prisma.user.update({
        where: { id: userId },
        data: { isAdmin: true }
    });

    revalidatePath('/admin/users');
    return { success: true };
}

export async function removeAdmin(userId: string) {
    await requireAdmin();

    await prisma.user.update({
        where: { id: userId },
        data: { isAdmin: false }
    });

    revalidatePath('/admin/users');
    return { success: true };
}

// Verification Actions
export async function toggleVerification(userId: string, field: 'phoneVerified' | 'emailVerified' | 'idVerified' | 'topRatedSeller') {
    await requireAdmin();

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { [field]: true }
    });

    await prisma.user.update({
        where: { id: userId },
        data: { [field]: !user?.[field] }
    });

    revalidatePath('/admin/users');
    return { success: true };
}

// Listing Moderation Actions
export async function approveListing(listingId: string) {
    await requireAdmin();

    await prisma.listing.update({
        where: { id: listingId },
        data: { moderationStatus: 'APPROVED' }
    });

    revalidatePath('/admin/listings');
    return { success: true };
}

export async function rejectListing(listingId: string) {
    await requireAdmin();

    await prisma.listing.update({
        where: { id: listingId },
        data: { moderationStatus: 'REJECTED' }
    });

    revalidatePath('/admin/listings');
    return { success: true };
}

export async function flagListing(listingId: string) {
    await requireAdmin();

    await prisma.listing.update({
        where: { id: listingId },
        data: { moderationStatus: 'FLAGGED' }
    });

    revalidatePath('/admin/listings');
    return { success: true };
}

// Platform Stats
export async function getPlatformStats() {
    await requireAdmin();

    const [
        totalUsers,
        totalListings,
        totalTransactions,
        pendingListings,
        bannedUsers
    ] = await Promise.all([
        prisma.user.count(),
        prisma.listing.count(),
        prisma.transaction.count(),
        prisma.listing.count({ where: { moderationStatus: 'PENDING' } }),
        prisma.user.count({ where: { banned: true } })
    ]);

    const totalRevenue = await prisma.transaction.aggregate({
        _sum: { amount: true }
    });

    return {
        totalUsers,
        totalListings,
        totalTransactions,
        pendingListings,
        bannedUsers,
        totalRevenue: totalRevenue._sum.amount || 0
    };
}
