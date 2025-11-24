import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import ReviewForm from '../ReviewForm';

export default async function ReviewPage({ params }: { params: Promise<{ transactionId: string }> }) {
    const session = await getSession();
    if (!session) redirect('/login');

    const { transactionId } = await params;

    const transaction = await prisma.transaction.findUnique({
        where: { id: transactionId },
        include: {
            listing: true,
            seller: true,
            review: true
        }
    });

    if (!transaction) notFound();

    // Security check
    if (transaction.buyerId !== session) {
        redirect('/');
    }

    // If already reviewed, redirect to purchases
    if (transaction.review) {
        redirect('/purchases');
    }

    return (
        <ReviewForm
            transactionId={transaction.id}
            sellerName={transaction.seller.name || 'Seller'}
            itemTitle={transaction.listing.title}
        />
    );
}
