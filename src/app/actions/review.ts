'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from '@/lib/badgeCalculator'
import { redirect } from 'next/navigation';
import { checkAndUpdateTopRatedStatus } from '@/lib/badgeCalculator';

export async function createReview(transactionId: string, rating: number, comment: string) {
    const session = await getSession();
    if (!session) throw new Error('Unauthorized');

    const transaction = await prisma.transaction.findUnique({
        where: { id: transactionId },
        include: { seller: true }
    });

    if (!transaction) throw new Error('Transaction not found');
    if (transaction.buyerId !== session) throw new Error('Not authorized to review this transaction');

    // Create Review
    await prisma.review.create({
        data: {
            rating,
            comment,
            reviewerId: session,
            revieweeId: transaction.sellerId,
            transactionId
        }
    });

    // Update Seller Rating
    const reviews = await prisma.review.findMany({
        where: { revieweeId: transaction.sellerId }
    });

    const totalRating = reviews.reduce((acc, r) => acc + r.rating, 0);
    const avgRating = totalRating / reviews.length;

    await prisma.user.update({
        where: { id: transaction.sellerId },
        data: { rating: avgRating }
    });

    // Check and update Top Rated status
    await checkAndUpdateTopRatedStatus(transaction.sellerId);

    revalidatePath('/purchases');
    redirect('/purchases');
}
