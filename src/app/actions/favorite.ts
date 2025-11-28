'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function toggleFavorite(listingId: string) {
    try {
        const session = await getSession();
        if (!session) return { error: 'Unauthorized' };

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
            revalidatePath('/');
            return { favorited: false };
        } else {
            await prisma.favorite.create({
                data: {
                    userId: session,
                    listingId
                }
            });
            revalidatePath('/');
            return { favorited: true };
        }
    } catch (error) {
        console.error('Toggle favorite error:', error);
        return { error: 'Failed to toggle favorite' };
    }
}
