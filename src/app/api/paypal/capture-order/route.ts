import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PayPal SDK
const paypal = require('@paypal/checkout-server-sdk');

function paypalClient() {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    // Explicitly check for 'live' mode, otherwise default to sandbox
    const environment = process.env.PAYPAL_MODE === 'live'
        ? new paypal.core.LiveEnvironment(clientId, clientSecret)
        : new paypal.core.SandboxEnvironment(clientId, clientSecret);

    return new paypal.core.PayPalHttpClient(environment);
}

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { orderID, listingId, shippingMethod, shippingAddress, shippingCost } = await request.json();

        // Capture the PayPal order
        const requestCapture = new paypal.orders.OrdersCaptureRequest(orderID);
        requestCapture.requestBody({});

        const client = paypalClient();
        const capture = await client.execute(requestCapture);

        if (capture.result.status !== 'COMPLETED') {
            return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
        }

        // Fetch listing
        const listing = await prisma.listing.findUnique({
            where: { id: listingId },
        });

        if (!listing) {
            return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
        }

        // Calculate amounts
        const amount = listing.price;
        const fee = amount * 0.05;
        const netAmount = amount - fee;

        // Create transaction
        const transaction = await prisma.transaction.create({
            data: {
                buyerId: session,
                sellerId: listing.sellerId,
                listingId: listing.id,
                amount: amount,
                fee: fee,
                netAmount: netAmount,
                status: 'COMPLETED',
                // Shipping details
                shippingMethod: shippingMethod,
                shippingAddress: shippingAddress,
                shippingCost: shippingCost,
                // Payment details
                paymentMethod: 'PAYPAL',
                paypalOrderId: orderID,
                // Shipment status
                shipmentStatus: 'PENDING_SHIPMENT',
                // Escrow flags
                buyerConfirmed: false,
                fundsReleased: false,
            }
        });

        // Mark listing as sold
        await prisma.listing.update({
            where: { id: listingId },
            data: { status: 'SOLD' }
        });

        // Update Seller Wallet (Pending Balance)
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

        return NextResponse.json({
            success: true,
            transactionId: transaction.id,
            captureId: capture.result.id
        });

    } catch (error: any) {
        console.error('PayPal capture error:', error);
        return NextResponse.json({
            error: error?.message || 'Failed to capture PayPal payment'
        }, { status: 500 });
    }
}
