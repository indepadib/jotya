'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function markAsShipped(transactionId: string, trackingNumber?: string) {
    const session = await getSession();
    if (!session) throw new Error('Unauthorized');

    const transaction = await prisma.transaction.findUnique({
        where: { id: transactionId }
    });

    if (!transaction) throw new Error('Transaction not found');
    if (transaction.sellerId !== session) throw new Error('Unauthorized');

    // Update transaction status and shipment details
    await prisma.transaction.update({
        where: { id: transactionId },
        data: {
            status: 'SHIPPED',
            shipmentStatus: 'SHIPPED',
            trackingNumber: trackingNumber,
            shippedAt: new Date()
        }
    });

    // Notify buyer
    await prisma.message.create({
        data: {
            content: `📦 Your item has been shipped! ${trackingNumber ? `Tracking Number: ${trackingNumber}` : ''}`,
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

    // Update transaction status and escrow flags
    await prisma.transaction.update({
        where: { id: transactionId },
        data: {
            status: 'DELIVERED',
            shipmentStatus: 'DELIVERED',
            deliveredAt: new Date(),
            buyerConfirmed: true,
            confirmedAt: new Date(),
            fundsReleased: true,
            releasedAt: new Date()
        }
    });

    // Release funds to seller
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
    } else {
        // Create wallet if it doesn't exist (shouldn't happen usually but good safety)
        await prisma.wallet.create({
            data: {
                userId: transaction.sellerId,
                balance: transaction.netAmount,
                pending: 0
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
