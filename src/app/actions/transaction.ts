'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth'; // Assuming we have this or similar

// Mock Stripe Payment Processing
async function mockStripeCharge(amount: number, cardDetails: any) {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate success (could add random failure for testing)
    return { success: true, transactionId: 'ch_' + Math.random().toString(36).substr(2, 9) };
}

export async function processPayment(listingId: string, cardDetails: any) {
    const session = await getSession();

    if (!session) {
        throw new Error('Unauthorized');
    }

    const listing = await prisma.listing.findUnique({
        where: { id: listingId },
        include: { seller: true }
    });

    if (!listing) throw new Error('Listing not found');
    if (listing.status !== 'AVAILABLE') throw new Error('Listing is no longer available');

    // 1. Check for Accepted Offer
    const acceptedOffer = await prisma.message.findFirst({
        where: {
            listingId,
            senderId: session, // Buyer is sender of offer
            receiverId: listing.sellerId,
            type: 'OFFER',
            offerStatus: 'ACCEPTED'
        },
        orderBy: { createdAt: 'desc' }
    });

    const finalPrice = acceptedOffer ? (acceptedOffer.offerAmount || listing.price) : listing.price;

    // 2. Process Payment (Mock)
    const paymentResult = await mockStripeCharge(finalPrice, cardDetails);

    if (!paymentResult.success) throw new Error('Payment failed');

    // 3. Calculate Fees
    const PLATFORM_FEE_PERCENT = 0.05;
    const fee = finalPrice * PLATFORM_FEE_PERCENT;
    const netAmount = finalPrice - fee;

    // 4. Create Transaction Record
    const transaction = await prisma.transaction.create({
        data: {
            buyerId: session,
            sellerId: listing.sellerId,
            listingId: listing.id,
            amount: finalPrice,
            fee: fee,
            netAmount: netAmount,
            status: 'PAID' // Initial state before shipping
        }
    });

    // 4. Update Listing Status
    await prisma.listing.update({
        where: { id: listingId },
        data: { status: 'SOLD' }
    });

    // 5. Update Seller Wallet (Pending Balance)
    // Upsert wallet for seller
    await prisma.wallet.upsert({
        where: { userId: listing.sellerId },
        create: {
            userId: listing.sellerId,
            balance: 0,
            pending: netAmount
        },
        update: {
            pending: { increment: netAmount }
        }
    });

    revalidatePath(`/items/${listingId}`);
    revalidatePath('/wallet');

    return { success: true, transactionId: transaction.id };
}

export async function getWallet() {
    const session = await getSession();
    if (!session) return null;

    const wallet = await prisma.wallet.findUnique({
        where: { userId: session }
    });

    if (!wallet) {
        // Return empty wallet if none exists
        return { balance: 0, pending: 0 };
    }

    return wallet;
}

export async function withdrawFunds() {
    const session = await getSession();
    if (!session) throw new Error('Unauthorized');

    const wallet = await prisma.wallet.findUnique({
        where: { userId: session }
    });

    if (!wallet || wallet.balance <= 0) {
        throw new Error('Insufficient funds');
    }

    // Simulate withdrawal delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Reset balance
    await prisma.wallet.update({
        where: { userId: session },
        data: { balance: 0 }
    });

    revalidatePath('/wallet');
    return { success: true };
}

export async function getTransactions() {
    const session = await getSession();
    if (!session) return [];

    const transactions = await prisma.transaction.findMany({
        where: {
            OR: [
                { buyerId: session },
                { sellerId: session }
            ]
        },
        include: {
            listing: {
                select: {
                    title: true,
                    images: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    return transactions;
}
