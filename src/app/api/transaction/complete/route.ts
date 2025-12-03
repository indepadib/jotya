import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { sendEmail, EMAIL_TEMPLATES } from '@/lib/email';

export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { transactionId } = await req.json();
        if (!transactionId) {
            return NextResponse.json({ error: 'Transaction ID is required' }, { status: 400 });
        }

        const transaction = await prisma.transaction.findUnique({
            where: { id: transactionId },
            include: { seller: true }
        });

        if (!transaction) {
            return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
        }

        // Only Buyer can confirm
        if (transaction.buyerId !== session) {
            return NextResponse.json({ error: 'Only the buyer can confirm the order' }, { status: 403 });
        }

        if (transaction.shipmentStatus === 'COMPLETED') {
            return NextResponse.json({ error: 'Order already completed' }, { status: 400 });
        }

        // Release Funds
        await prisma.$transaction(async (tx) => {
            // 1. Update Transaction Status
            await tx.transaction.update({
                where: { id: transactionId },
                data: { shipmentStatus: 'COMPLETED' }
            });

            // 2. Credit Seller Wallet
            await tx.wallet.upsert({
                where: { userId: transaction.sellerId },
                update: { balance: { increment: transaction.amount } },
                create: { userId: transaction.sellerId, balance: transaction.amount }
            });
        });

        // Notify Seller
        if (transaction.seller.email) {
            await sendEmail({
                to: transaction.seller.email,
                subject: 'Order Completed - Funds Released',
                html: EMAIL_TEMPLATES.DELIVERED_SELLER(transaction.seller.name || 'Seller', transaction.amount)
            });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error completing order:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
