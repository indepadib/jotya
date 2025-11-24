'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { sendOfferNotification, sendOfferResponseNotification } from '@/lib/email';

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

        // Send email notification to seller
        const [buyer, seller] = await Promise.all([
            prisma.user.findUnique({ where: { id: session }, select: { name: true } }),
            prisma.user.findUnique({ where: { id: listing.sellerId }, select: { email: true } })
        ]);

        if (buyer && seller?.email) {
            await sendOfferNotification(
                seller.email,
                buyer.name || 'Someone',
                amount,
                listing.title
            );
        }

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

    // Send email notification to buyer
    const buyer = await prisma.user.findUnique({
        where: { id: message.senderId },
        select: { email: true }
    });

    if (buyer?.email && message.listing) {
        await sendOfferResponseNotification(
            buyer.email,
            status,
            message.listing.title
        );
    }

    // System message to notify
    await prisma.message.create({
        data: {
            content: `Your offer has been ${status === 'ACCEPTED' ? 'accepted' : 'declined'}`,
            senderId: session,
            receiverId: message.senderId,
            listingId: message.listingId,
            type: 'TEXT'
        }
    });

    revalidatePath('/inbox');
    return { success: true };
}
