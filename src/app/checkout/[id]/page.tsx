import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { notFound } from 'next/navigation';
import CheckoutForm from './CheckoutForm';

export default async function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const listing = await prisma.listing.findUnique({
        where: { id }
    });

    if (!listing) {
        notFound();
    }

    const session = await getSession();

    // Check for accepted offer
    const acceptedOffer = session ? await prisma.message.findFirst({
        where: {
            listingId: id,
            senderId: session,
            receiverId: listing.sellerId,
            type: 'OFFER',
            offerStatus: 'ACCEPTED'
        },
        orderBy: { createdAt: 'desc' }
    }) : null;

    const effectivePrice = acceptedOffer ? (acceptedOffer.offerAmount || listing.price) : listing.price;
    const isOfferPrice = !!acceptedOffer;

    return <CheckoutForm listing={listing} effectivePrice={effectivePrice} isOfferPrice={isOfferPrice} />;
}
