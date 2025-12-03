import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ShipmentStatus } from '@/lib/shipping';
import { sendEmail, EMAIL_TEMPLATES } from '@/lib/email';

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

            // 4. Fund Release Logic REMOVED for Buyer Protection
            // Funds are now released via /api/transaction/complete or after 48h

            return { updatedLabel, transaction, statusChanged: label.status !== status };
        });

        // 5. Send Emails (Outside Transaction)
        const { transaction, statusChanged } = result as any;

        if (statusChanged) {
            // Fetch buyer/seller emails if needed (or assume we need to fetch them now)
            const fullTransaction = await prisma.transaction.findUnique({
                where: { id: transaction.id },
                include: { buyer: true, seller: true }
            });

            if (fullTransaction) {
                if (status === ShipmentStatus.OUT_FOR_DELIVERY && fullTransaction.buyer.email) {
                    await sendEmail({
                        to: fullTransaction.buyer.email,
                        subject: `Out for Delivery: ${trackingNumber}`,
                        html: EMAIL_TEMPLATES.OUT_FOR_DELIVERY(fullTransaction.buyer.name || 'Buyer', trackingNumber)
                    });
                }

                if (status === ShipmentStatus.DELIVERED) {
                    // Email Buyer
                    if (fullTransaction.buyer.email) {
                        await sendEmail({
                            to: fullTransaction.buyer.email,
                            subject: `Delivered: ${trackingNumber}`,
                            html: EMAIL_TEMPLATES.DELIVERED_BUYER(fullTransaction.buyer.name || 'Buyer', trackingNumber)
                        });
                    }
                    // Email Seller - Update message
                    if (fullTransaction.seller.email) {
                        await sendEmail({
                            to: fullTransaction.seller.email,
                            subject: `Item Delivered - Funds Pending`,
                            html: `
                                <h1>Item Delivered</h1>
                                <p>Hi ${fullTransaction.seller.name || 'Seller'},</p>
                                <p>Your package has been delivered.</p>
                                <p>Funds will be released in 48 hours if no issue is reported by the buyer.</p>
                            `
                        });
                    }
                }
            }
        }

        return NextResponse.json(result.updatedLabel);

    } catch (error) {
        console.error('Error updating shipping status:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
