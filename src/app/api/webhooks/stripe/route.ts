import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

export async function POST(request: Request) {
    // Initialize Stripe inside function to avoid build-time errors
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
        return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2025-11-17.clover' as any,
    });

    const body = await request.text();
    const sig = (await headers()).get('stripe-signature')!;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err: any) {
        console.error(`Webhook signature verification failed.`, err.message);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const metadata = session.metadata;

        if (metadata) {
            const { listingId, buyerId, sellerId, amount, fee } = metadata;
            const amountFloat = parseFloat(amount);
            const feeFloat = parseFloat(fee);
            const netAmount = amountFloat - feeFloat;

            try {
                // 1. Create Transaction
                await prisma.transaction.create({
                    data: {
                        buyerId,
                        sellerId,
                        listingId,
                        amount: amountFloat,
                        fee: feeFloat,
                        netAmount,
                        status: 'COMPLETED',
                    },
                });

                // 2. Update Listing Status
                await prisma.listing.update({
                    where: { id: listingId },
                    data: { status: 'SOLD' },
                });

                // 3. Update Seller Wallet
                // Upsert wallet to ensure it exists
                await prisma.wallet.upsert({
                    where: { userId: sellerId },
                    update: {
                        pending: { increment: netAmount },
                    },
                    create: {
                        userId: sellerId,
                        balance: 0,
                        pending: netAmount,
                    },
                });

                console.log(`Payment successful for listing ${listingId}`);
            } catch (error) {
                console.error('Error processing successful payment:', error);
                return NextResponse.json({ error: 'Error processing payment' }, { status: 500 });
            }
        }
    }

    return NextResponse.json({ received: true });
}
