import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

export async function GET(req: NextRequest) {
    try {
        await requireAdmin();
        const disputes = await prisma.dispute.findMany({
            include: {
                transaction: {
                    include: {
                        buyer: true,
                        seller: true,
                        listing: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(disputes);
    } catch (error) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        await requireAdmin();
        const { id, resolution } = await req.json(); // resolution: 'REFUND_BUYER' | 'RELEASE_SELLER'

        const dispute = await prisma.dispute.findUnique({
            where: { id },
            include: { transaction: true }
        });

        if (!dispute) return NextResponse.json({ error: 'Dispute not found' }, { status: 404 });
        if (dispute.status !== 'OPEN') return NextResponse.json({ error: 'Already resolved' }, { status: 400 });

        await prisma.$transaction(async (tx) => {
            if (resolution === 'REFUND_BUYER') {
                // 1. Update Dispute
                await tx.dispute.update({
                    where: { id },
                    data: { status: 'RESOLVED_REFUND', resolution: 'Refunded to Buyer' }
                });
                // 2. Update Transaction
                await tx.transaction.update({
                    where: { id: dispute.transactionId },
                    data: { status: 'CANCELLED', shipmentStatus: 'RETURNED' }
                });
                // 3. Refund Logic (Mock for now - would trigger Stripe/Wallet refund)
                // If paid via Wallet, credit buyer. If Stripe, trigger Stripe Refund.
                console.log(`Refund triggered for transaction ${dispute.transactionId}`);

            } else if (resolution === 'RELEASE_SELLER') {
                // 1. Update Dispute
                await tx.dispute.update({
                    where: { id },
                    data: { status: 'RESOLVED_RELEASE', resolution: 'Funds Released to Seller' }
                });
                // 2. Update Transaction
                await tx.transaction.update({
                    where: { id: dispute.transactionId },
                    data: { shipmentStatus: 'COMPLETED' }
                });
                // 3. Credit Seller Wallet
                await tx.wallet.upsert({
                    where: { userId: dispute.transaction.sellerId },
                    update: { balance: { increment: dispute.transaction.amount } },
                    create: { userId: dispute.transaction.sellerId, balance: dispute.transaction.amount }
                });
            }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
