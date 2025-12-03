import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { sendEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { transactionId, reason } = await req.json();

        const transaction = await prisma.transaction.findUnique({
            where: { id: transactionId },
            include: { seller: true, buyer: true }
        });

        if (!transaction) {
            return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
        }

        if (transaction.buyerId !== session) {
            return NextResponse.json({ error: 'Only the buyer can report an issue' }, { status: 403 });
        }

        // Update Status to DISPUTE
        await prisma.transaction.update({
            where: { id: transactionId },
            data: { shipmentStatus: 'DISPUTE' }
        });

        // Create Report Record
        await prisma.report.create({
            data: {
                reason: 'Order Dispute',
                description: reason,
                reporterId: session,
                reportedId: transaction.sellerId,
                status: 'OPEN'
            }
        });

        // Notify Admin/Seller
        // (Simplified notification)
        console.log(`Dispute opened for transaction ${transactionId}: ${reason}`);

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error opening dispute:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
