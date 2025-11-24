'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createOffer(listingId: string, amount: number) {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    const listing = await prisma.listing.findUnique({
        where: { id: listingId },
        select: { sellerId: true, title: true }
    });

    if (!listing) return { error: 'Listing not found' };
    if (listing.sellerId === session) return { error: 'Cannot make offer on your own item' };

    // Check if conversation exists
    let conversation = await prisma.message.findFirst({
        where: {
            listingId,
            OR: [
                { senderId: session, receiverId: listing.sellerId },
                { senderId: listing.sellerId, receiverId: session }
            ]
        }
    });

    try {
        // Create offer message
        await prisma.message.create({
            data: {
                content: `Offer: ${amount} MAD`,
                senderId: session,
                receiverId: listing.sellerId,
                listingId,
                type: 'OFFER',
                offerAmount: amount,
                offerStatus: 'PENDING'
            }
        });

        revalidatePath(`/items/${listingId}`);
    } catch (error) {
        console.error('Failed to create offer:', error);
        return { error: 'Failed to create offer' };
    }

    redirect(`/inbox/${listing.sellerId}`);
}

export async function respondToOffer(messageId: string, status: 'ACCEPTED' | 'REJECTED') {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    const message = await prisma.message.findUnique({
        where: { id: messageId },
        include: { listing: true }
    });

    if (!message) return { error: 'Message not found' };

    // Only the receiver of the offer (the seller) can respond
    if (message.receiverId !== session) return { error: 'Unauthorized' };

    await prisma.message.update({
        where: { id: messageId },
        data: { offerStatus: status }
    });

    // Send a system message notifying the buyer
    await prisma.message.create({
        data: {
            content: status === 'ACCEPTED'
                ? `🎉 Offer accepted! You can now buy ${(message as any).listing?.title} for ${(message as any).offerAmount} MAD.`
                : `Offer for ${(message as any).offerAmount} MAD was declined.`,
            senderId: session,
            receiverId: message.senderId,
            listingId: message.listingId,
            type: 'TEXT'
        }
    });

    revalidatePath('/inbox');
}
