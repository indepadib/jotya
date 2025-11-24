import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import SellForm from '@/app/sell/SellForm';

export default async function EditItemPage({ params }: { params: Promise<{ id: string }> }) {
    const session = (await cookies()).get('session')?.value;
    if (!session) {
        redirect('/login');
    }

    const { id } = await params;

    const listing = await prisma.listing.findUnique({
        where: { id },
    });

    if (!listing) {
        notFound();
    }

    if (listing.sellerId !== session) {
        redirect('/');
    }

    // Transform listing data to match SellFormProps
    const initialData = {
        id: listing.id,
        title: listing.title,
        description: listing.description,
        price: listing.price,
        images: listing.images as string,
        brand: listing.brand,
        condition: listing.condition,
        size: listing.size,
        color: listing.color,
        gender: listing.gender,
        category: listing.category,
        itemType: listing.itemType,
        subtype: listing.subtype,
        verified: listing.verified,
        aiConfidence: listing.aiConfidence,
    };

    return <SellForm initialData={initialData} />;
}
