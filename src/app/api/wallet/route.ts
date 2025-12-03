import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { amount, method, details } = await req.json();

        if (!amount || amount <= 0) {
            return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
        }

        const wallet = await prisma.wallet.findUnique({
            where: { userId: session }
        });

        if (!wallet) {
            return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
        }

        if (wallet.balance < amount) {
            return NextResponse.json({ error: 'Insufficient funds' }, { status: 400 });
        }

        // Create Payout Request and Deduct Balance atomically
        const result = await prisma.$transaction(async (tx) => {
            const payout = await tx.payoutRequest.create({
                data: {
                    walletId: wallet.id,
                    amount,
                    method,
                    details,
                    status: 'PENDING'
                }
            });

            await tx.wallet.update({
                where: { id: wallet.id },
                data: {
                    balance: { decrement: amount },
                    pending: { increment: amount } // Move to pending until processed? Or just deduct?
                    // Usually, we deduct from balance. If rejected, we refund.
                }
            });

            return payout;
        });

        return NextResponse.json(result);

    } catch (error) {
        console.error('Error requesting payout:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const wallet = await prisma.wallet.findUnique({
            where: { userId: session },
            include: { payouts: { orderBy: { createdAt: 'desc' } } }
        });

        if (!wallet) {
            return NextResponse.json({ balance: 0, payouts: [] });
        }

        return NextResponse.json(wallet);

    } catch (error) {
        console.error('Error fetching wallet:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
