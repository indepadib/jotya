import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ShipmentStatus } from '@/lib/shipping';
import { sendEmail, EMAIL_TEMPLATES } from '@/lib/email';

// Handle both POST and PUT as some services use PUT for updates
export async function POST(req: NextRequest) {
    return handleWebhook(req);
}

export async function PUT(req: NextRequest) {
    return handleWebhook(req);
}

async function handleWebhook(req: NextRequest) {
    try {
        const data = await req.json();
        console.log('Digylog Webhook received:', data);

        // Expected payload structure (Hypothetical - adjust based on actual docs)
        // { tracking_number: "...", status: "...", ... }
        const trackingNumber = data.tracking_number || data.trackingNumber || data.ref;
        const carrierStatus = data.status;

        if (!trackingNumber || !carrierStatus) {
            return NextResponse.json({ error: 'Missing tracking number or status' }, { status: 400 });
        }

        // Map Digylog status to internal status
        let internalStatus = ShipmentStatus.IN_TRANSIT;
        const statusUpper = carrierStatus.toUpperCase();

        if (statusUpper.includes('DELIV') || statusUpper === 'LIVRÉ') internalStatus = ShipmentStatus.DELIVERED;
        else if (statusUpper.includes('PICK') || statusUpper === 'RAMASSÉ') internalStatus = ShipmentStatus.PICKED_UP;
        else if (statusUpper.includes('RETURN') || statusUpper === 'RETOURNÉ') internalStatus = ShipmentStatus.RETURNED;

        // Update ShippingLabel
        const label = await prisma.shippingLabel.findUnique({
            where: { trackingNumber }
        });

        if (!label) {
            return NextResponse.json({ error: 'Label not found' }, { status: 404 });
        }

        // Use the existing update logic (reuse the update-status API logic or call it)
        // For simplicity/robustness, we duplicate the core logic here or extract it to a service function.
        // I'll duplicate the core update + fund release logic here for now to ensure it works independently.

        const result = await prisma.$transaction(async (tx) => {
            // 1. Update Label History
            const currentHistory = (label.statusHistory as any[]) || [];
            const newHistoryItem = {
                status: internalStatus,
                timestamp: new Date().toISOString(),
                location: data.location || 'Carrier Update',
                notes: data.notes || `Digylog Status: ${carrierStatus}`,
                scannedBy: 'Digylog Webhook'
            };

            const updatedLabel = await tx.shippingLabel.update({
                where: { trackingNumber },
                data: {
                    status: internalStatus,
                    statusHistory: [...currentHistory, newHistoryItem]
                }
            });

            // 2. Determine Transaction Status
            let transactionStatus = 'IN_TRANSIT';
            if (internalStatus === ShipmentStatus.DELIVERED) transactionStatus = 'DELIVERED';

            // 3. Update Transaction
            const transaction = await tx.transaction.update({
                where: { id: label.transactionId },
                data: {
                    shipmentStatus: transactionStatus,
                    ...(internalStatus === ShipmentStatus.DELIVERED ? { deliveredAt: new Date() } : {}),
                    ...(internalStatus === ShipmentStatus.PICKED_UP ? { shippedAt: new Date() } : {})
                }
            });

            // 4. Fund Release Logic
            if (internalStatus === ShipmentStatus.DELIVERED && label.status !== ShipmentStatus.DELIVERED) {
                await tx.wallet.upsert({
                    where: { userId: transaction.sellerId },
                    update: { balance: { increment: transaction.amount } },
                    create: { userId: transaction.sellerId, balance: transaction.amount }
                });
            }

            return { updatedLabel, transaction, statusChanged: label.status !== internalStatus };
        });

        // Send Emails
        const { transaction, statusChanged } = result;
        if (statusChanged && internalStatus === ShipmentStatus.DELIVERED) {
            // Fetch full transaction with relations for email
            const fullTx = await prisma.transaction.findUnique({
                where: { id: transaction.id },
                include: { buyer: true, seller: true }
            });

            if (fullTx) {
                if (fullTx.buyer.email) {
                    await sendEmail({
                        to: fullTx.buyer.email,
                        subject: `Delivered: ${trackingNumber}`,
                        html: EMAIL_TEMPLATES.DELIVERED_BUYER(fullTx.buyer.name || 'Buyer', trackingNumber)
                    });
                }
                if (fullTx.seller.email) {
                    await sendEmail({
                        to: fullTx.seller.email,
                        subject: `Funds Released`,
                        html: EMAIL_TEMPLATES.DELIVERED_SELLER(fullTx.seller.name || 'Seller', fullTx.amount)
                    });
                }
            }
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Webhook Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
