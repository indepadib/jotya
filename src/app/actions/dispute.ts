'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function createDispute(transactionId: string, reason: string, description: string) {
    const session = await getSession();
    if (!session) return { success: false, error: 'Unauthorized' };

    try {
        const transaction = await prisma.transaction.findUnique({
            where: { id: transactionId }
        });

        if (!transaction) return { success: false, error: 'Transaction not found' };
        if (transaction.buyerId !== session) return { success: false, error: 'Unauthorized' };

        // Create dispute
        await (prisma as any).dispute.create({
            data: {
                transactionId,
                reason,
                description,
                status: 'OPEN'
            }
        });

        // Notify seller
        await prisma.message.create({
            data: {
                content: `⚠️ A dispute has been opened for this transaction. Reason: ${reason}`,
                senderId: session,
                receiverId: transaction.sellerId,
                listingId: transaction.listingId,
                type: 'TEXT'
            }
        });

        revalidatePath('/purchases');
        return { success: true };
    } catch (error: any) {
        console.error('Dispute creation error:', error);
        return { success: false, error: 'Failed to create dispute' };
    }
}
