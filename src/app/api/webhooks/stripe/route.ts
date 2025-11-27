import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-11-20.acacia',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
    const body = await request.text();
    const sig = headers().get('stripe-signature')!;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
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
