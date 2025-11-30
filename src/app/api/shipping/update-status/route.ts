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

        // Append to history
        const currentHistory = (label.statusHistory as any[]) || [];
        const newHistoryItem = {
            status,
            timestamp: new Date().toISOString(),
            location: location || 'Unknown Location',
            notes: notes || '',
            scannedBy: scannedBy || 'Carrier'
        };

        const updatedLabel = await prisma.shippingLabel.update({
            where: { trackingNumber },
            data: {
                status,
                statusHistory: [...currentHistory, newHistoryItem]
            }
        });

        // Update transaction status mapping
        let transactionStatus = 'IN_TRANSIT';
        if (status === ShipmentStatus.DELIVERED) transactionStatus = 'DELIVERED';
        if (status === ShipmentStatus.PENDING_PICKUP) transactionStatus = 'PENDING_SHIPMENT';

        await prisma.transaction.update({
            where: { id: label.transactionId },
            data: {
                shipmentStatus: transactionStatus,
                ...(status === ShipmentStatus.DELIVERED ? { deliveredAt: new Date() } : {}),
                ...(status === ShipmentStatus.PICKED_UP ? { shippedAt: new Date() } : {})
            }
        });

        return NextResponse.json(updatedLabel);

    } catch (error) {
        console.error('Error updating shipping status:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
