import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { listingId, amount, shippingMethod, shippingAddress, paymentMethod, shippingCost } = await request.json();

        const listing = await prisma.listing.findUnique({
            where: { id: listingId },
            include: { seller: true }
        });

        if (!listing) {
            return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
        }

        if (listing.status !== 'AVAILABLE') {
            return NextResponse.json({
                error: `Listing is not available. Current status: ${listing.status}`
            }, { status: 400 });
        }

        // Calculate fees
        const fee = amount * 0.05; // 5% platform fee
        const netAmount = amount - fee;

        // Create transaction with full shipping and payment details
        const transaction = await prisma.transaction.create({
            data: {
                buyerId: session,
                sellerId: listing.sellerId,
                listingId: listing.id,
                amount: amount,
                fee: fee,
                netAmount: netAmount,
                status: paymentMethod === 'COD' ? 'PENDING_COD' : 'PENDING',
                // Shipping details
                shippingMethod: shippingMethod,
                shippingAddress: shippingAddress,
                shippingCost: shippingCost,
                // Payment details
                paymentMethod: paymentMethod,
                // Shipment status
                shipmentStatus: 'PENDING_SHIPMENT',
                // Escrow status
                buyerConfirmed: false,
                fundsReleased: false,
            }
        });

        // Update listing status to SOLD
        await prisma.listing.update({
            where: { id: listingId },
            data: { status: 'SOLD' }
        });

        return NextResponse.json({
            success: true,
            transactionId: transaction.id
        });

    } catch (error) {
        console.error('Transaction creation error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
