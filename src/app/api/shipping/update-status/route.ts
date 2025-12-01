import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ShipmentStatus } from '@/lib/shipping';

export async function POST(req: NextRequest) {
    try {
        const { trackingNumber, status, location, notes, scannedBy } = await req.json();

        if (!trackingNumber || !status) {
            return NextResponse.json({ error: 'Tracking number and status are required' }, { status: 400 });
        }

        const label = await prisma.shippingLabel.findUnique({
            where: { trackingNumber }
        });

        if (!label) {
            return NextResponse.json({ error: 'Shipping label not found' }, { status: 404 });
        }

        const result = await prisma.$transaction(async (tx) => {
            // 1. Update Label History
            const currentHistory = (label.statusHistory as any[]) || [];
            const newHistoryItem = {
                status,
                timestamp: new Date().toISOString(),
                location: location || 'Unknown Location',
                notes: notes || '',
                scannedBy: scannedBy || 'Carrier'
            };

            const updatedLabel = await tx.shippingLabel.update({
                where: { trackingNumber },
                data: {
                    status,
                    statusHistory: [...currentHistory, newHistoryItem]
                }
            });

            // 2. Determine Transaction Status
            let transactionStatus = 'IN_TRANSIT';
            if (status === ShipmentStatus.DELIVERED) transactionStatus = 'DELIVERED';
            if (status === ShipmentStatus.PENDING_PICKUP) transactionStatus = 'PENDING_SHIPMENT';

            // 3. Update Transaction
            const transaction = await tx.transaction.update({
                where: { id: label.transactionId },
                data: {
                    shipmentStatus: transactionStatus,
                    ...(status === ShipmentStatus.DELIVERED ? { deliveredAt: new Date() } : {}),
                    ...(status === ShipmentStatus.PICKED_UP ? { shippedAt: new Date() } : {})
                }
            });

            // 4. Fund Release Logic (If Delivered and not previously delivered)
            if (status === ShipmentStatus.DELIVERED && label.status !== ShipmentStatus.DELIVERED) {
                // Credit Seller's Wallet
                await tx.wallet.upsert({
                    where: { userId: transaction.sellerId },
                    update: {
                        balance: { increment: transaction.amount }
                    },
                    create: {
                        userId: transaction.sellerId,
                        balance: transaction.amount
                    }
                });

                console.log(`Funds released for transaction ${transaction.id}: ${transaction.amount} MAD`);
            }

            return updatedLabel;
        });

        return NextResponse.json(result);

    } catch (error) {
        console.error('Error updating shipping status:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
