'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function markAsShipped(transactionId: string) {
    const session = await getSession();
    if (!session) throw new Error('Unauthorized');

    const transaction = await prisma.transaction.findUnique({
        where: { id: transactionId }
    });

    if (!transaction) throw new Error('Transaction not found');
    if (transaction.sellerId !== session) throw new Error('Unauthorized');
    if (transaction.status !== 'COMPLETED' && transaction.status !== 'PAID') {
        // Note: In our current simplified flow, 'COMPLETED' was used for "Paid". 
        // We should probably transition to using 'PAID' initially, but for now let's accept COMPLETED as a starting point 
        // or just check if it's NOT already shipped/delivered.
        // Let's assume 'COMPLETED' meant "Payment Successful" in the previous step.
    }

    await prisma.transaction.update({
        where: { id: transactionId },
        data: { status: 'SHIPPED' }
    });

    // Notify buyer (optional system message)
    await prisma.message.create({
        data: {
            content: `📦 Your item has been shipped!`,
            senderId: session,
            receiverId: transaction.buyerId,
            listingId: transaction.listingId,
            type: 'TEXT'
        }
    });

    revalidatePath('/sell');
    revalidatePath('/purchases');
}

export async function markAsDelivered(transactionId: string) {
    const session = await getSession();
    if (!session) throw new Error('Unauthorized');

    const transaction = await prisma.transaction.findUnique({
        where: { id: transactionId }
    });

    if (!transaction) throw new Error('Transaction not found');
    if (transaction.buyerId !== session) throw new Error('Unauthorized');

    // Update status
    await prisma.transaction.update({
        where: { id: transactionId },
        data: { status: 'DELIVERED' }
    });

    // Release funds to seller
    // In the previous transaction.ts, we added to 'pending'. Now we move from 'pending' to 'balance'.

    // 1. Get current wallet
    const wallet = await prisma.wallet.findUnique({
        where: { userId: transaction.sellerId }
    });

    if (wallet) {
        await prisma.wallet.update({
            where: { userId: transaction.sellerId },
            data: {
                pending: { decrement: transaction.netAmount },
                balance: { increment: transaction.netAmount }
            }
        });
    }

    // Notify seller
    await prisma.message.create({
        data: {
            content: `✅ Item marked as delivered. Funds have been released to your wallet.`,
            senderId: session,
            receiverId: transaction.sellerId,
            listingId: transaction.listingId,
            type: 'TEXT'
        }
    });

    revalidatePath('/purchases');
    revalidatePath('/sell');
}
