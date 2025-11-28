import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

export async function POST(request: Request) {
    try {
        // Initialize Stripe inside function to avoid build-time errors
        if (!process.env.STRIPE_SECRET_KEY) {
            return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
        }

        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
            apiVersion: '2025-11-17.clover' as any,
        });
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { listingId } = await request.json();

        const listing = await prisma.listing.findUnique({
            where: { id: listingId },
            include: { seller: true }
        });

        if (!listing) {
            return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
        }

        console.log('[Checkout] Listing status:', listing.status, 'for listing:', listingId);

        if (listing.status !== 'AVAILABLE') {
            return NextResponse.json({
                error: `Listing is not available. Current status: ${listing.status}`
            }, { status: 400 });
        }

        // Calculate fees (e.g., 5% + fixed fee)
        // For simplicity, let's say platform fee is 5%
        const amount = listing.price;
        const fee = amount * 0.05;
        // Stripe expects amount in cents
        const unitAmount = Math.round(amount * 100);

        // Get the first image if available
        let images: string[] = [];
        try {
            images = JSON.parse(listing.images);
        } catch (e) {
            images = [];
        }
        const imageUrl = images.length > 0 ? images[0] : undefined;

        const stripeSession = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'mad', // Moroccan Dirham
                        product_data: {
                            name: listing.title,
                            images: imageUrl ? [imageUrl] : [],
                            metadata: {
                                listingId: listing.id
                            }
                        },
                        unit_amount: unitAmount,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/purchases?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/items/${listing.id}?canceled=true`,
            metadata: {
                listingId: listing.id,
                buyerId: session,
                sellerId: listing.sellerId,
                amount: amount.toString(),
                fee: fee.toString(),
            },
        });

        return NextResponse.json({ url: stripeSession.url });
    } catch (error: any) {
        console.error('Stripe Checkout Error:', error);
        console.error('Error message:', error?.message);
        console.error('Error stack:', error?.stack);
        return NextResponse.json({
            error: error?.message || 'Internal Server Error',
            details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
        }, { status: 500 });
    }
}
