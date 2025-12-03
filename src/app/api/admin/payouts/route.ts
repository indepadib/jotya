import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

export async function GET(req: NextRequest) {
    try {
        await requireAdmin();
        const payouts = await prisma.payoutRequest.findMany({
            include: { wallet: { include: { user: true } } },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(payouts);
    } catch (error) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        await requireAdmin();
        const { id, action } = await req.json(); // action: 'APPROVE' | 'REJECT'

        const payout = await prisma.payoutRequest.findUnique({
            where: { id },
            include: { wallet: true }
        });

        if (!payout) return NextResponse.json({ error: 'Payout not found' }, { status: 404 });
        if (payout.status !== 'PENDING') return NextResponse.json({ error: 'Already processed' }, { status: 400 });

        if (action === 'APPROVE') {
            await prisma.payoutRequest.update({
                where: { id },
                data: { status: 'PROCESSED' }
            });
            // Reduce pending balance
            await prisma.wallet.update({
                where: { id: payout.walletId },
                data: { pending: { decrement: payout.amount } }
            });
        } else if (action === 'REJECT') {
            await prisma.$transaction([
                prisma.payoutRequest.update({
                    where: { id },
                    data: { status: 'REJECTED' }
                }),
                // Refund to balance
                prisma.wallet.update({
                    where: { id: payout.walletId },
                    data: {
                        balance: { increment: payout.amount },
                        pending: { decrement: payout.amount }
                    }
                })
            ]);
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
