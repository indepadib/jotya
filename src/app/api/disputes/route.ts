import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { transactionId, reason, description } = await request.json();

        if (!transactionId || !reason || !description) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const transaction = await prisma.transaction.findUnique({
            where: { id: transactionId }
        });

        if (!transaction) {
            return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
        }

        if (transaction.buyerId !== session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Create dispute
        const dispute = await prisma.dispute.create({
            data: {
                transactionId,
                reason,
                description,
                status: 'OPEN'
            }
        });

        // Notify seller
        await prisma.message.create({
            data: {
                content: `⚠️ A dispute has been opened for this transaction. Reason: ${reason}`,
                senderId: session,
                receiverId: transaction.sellerId,
                listingId: transaction.listingId,
                type: 'TEXT'
            }
        });

        return NextResponse.json({ success: true, disputeId: dispute.id });

    } catch (error: any) {
        console.error('Dispute creation error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
