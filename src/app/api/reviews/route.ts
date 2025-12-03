import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { transactionId, rating, comment } = await req.json();

        if (!transactionId || !rating) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Verify transaction
        const transaction = await prisma.transaction.findUnique({
            where: { id: transactionId },
            include: { seller: true }
        });

        if (!transaction) {
            return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
        }

        if (transaction.buyerId !== session) {
            return NextResponse.json({ error: 'Only the buyer can leave a review' }, { status: 403 });
        }

        if (transaction.shipmentStatus !== 'COMPLETED') {
            return NextResponse.json({ error: 'Transaction must be completed before reviewing' }, { status: 400 });
        }

        // Create Review
        const review = await prisma.review.create({
            data: {
                rating,
                comment,
                reviewerId: session,
                revieweeId: transaction.sellerId,
                transactionId
            }
        });

        // Update Seller's Average Rating
        const sellerReviews = await prisma.review.findMany({
            where: { revieweeId: transaction.sellerId }
        });

        const totalRating = sellerReviews.reduce((sum, r) => sum + r.rating, 0);
        const averageRating = totalRating / sellerReviews.length;

        await prisma.user.update({
            where: { id: transaction.sellerId },
            data: { rating: averageRating }
        });

        return NextResponse.json(review);

    } catch (error) {
        console.error('Error creating review:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
