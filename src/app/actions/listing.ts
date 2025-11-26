'use server';

import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function createListing(formData: FormData) {
    const session = (await cookies()).get('session')?.value;

    if (!session) {
        redirect('/login');
    }

    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const priceStr = formData.get('price') as string;
    const brand = formData.get('brand') as string;
    const condition = formData.get('condition') as string;
    const size = formData.get('size') as string;
    const color = formData.get('color') as string;
    const imagesStr = formData.get('images') as string;
    const verified = formData.get('verified') === 'true';
    const aiConfidence = formData.get('aiConfidence') ? parseFloat(formData.get('aiConfidence') as string) : null;

    // Category fields
    const gender = formData.get('gender') as string | null;
    const category = formData.get('category') as string | null;
    const itemType = formData.get('itemType') as string | null;
    const subtype = formData.get('subtype') as string | null;

    if (!title || !description || !priceStr || !condition || !size || !color || !imagesStr) {
        return { error: 'Missing required fields' };
    }

    const price = parseFloat(priceStr);
    if (isNaN(price)) {
        return { error: 'Price must be a valid number.' };
    }

    let images: string[] = [];
    try {
        images = JSON.parse(imagesStr);
    } catch (e) {
        return { error: 'Invalid images data.' };
    }

    if (images.length < 5) {
        return { error: 'Minimum 5 photos required' };
    }

    await prisma.listing.create({
        data: {
            title,
            description,
            price,
            brand,
            condition,
            size,
            color,
            images: JSON.stringify(images),
            gender: gender || undefined,
            category: category || undefined,
            itemType: itemType || undefined,
            subtype: subtype || undefined,
            sellerId: session,
            status: 'AVAILABLE',
            verified,
            aiConfidence,
        },
    });

    redirect('/');
}

export async function updateListing(formData: FormData) {
    const session = (await cookies()).get('session')?.value;
    if (!session) return { error: 'Unauthorized' };

    const listingId = formData.get('id') as string;
    if (!listingId) return { error: 'Missing listing ID' };

    // Verify ownership
    const existing = await prisma.listing.findUnique({
        where: { id: listingId },
        select: { sellerId: true }
    });

    if (!existing || existing.sellerId !== session) {
        return { error: 'Unauthorized' };
    }

    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const priceStr = formData.get('price') as string;
    const brand = formData.get('brand') as string;
    const condition = formData.get('condition') as string;
    const size = formData.get('size') as string;
    const color = formData.get('color') as string;
    const verified = formData.get('verified') === 'true';
    const aiConfidence = formData.get('aiConfidence') ? parseFloat(formData.get('aiConfidence') as string) : null;

    // Category fields
    const gender = formData.get('gender') as string | null;
    const category = formData.get('category') as string | null;
    const itemType = formData.get('itemType') as string | null;
    const subtype = formData.get('subtype') as string | null;

    if (!title || !description || !priceStr || !condition || !size || !color) {
        return { error: 'Missing required fields' };
    }

    const price = parseFloat(priceStr);
    if (isNaN(price)) return { error: 'Invalid price' };

    // Note: We're not updating images during edit to avoid validation errors
    // Images remain unchanged from the original listing
    await prisma.listing.update({
        where: { id: listingId },
        data: {
            title,
            description,
            price,
            brand,
            condition,
            size,
            color,
            // images field is intentionally omitted - keeps existing images
            gender: gender || undefined,
            category: category || undefined,
            itemType: itemType || undefined,
            subtype: subtype || undefined,
            verified,
            aiConfidence,
        },
    });

    redirect(`/items/${listingId}`);
}

export async function deleteListing(listingId: string) {
    const session = (await cookies()).get('session')?.value;
    if (!session) return { error: 'Unauthorized' };

    const existing = await prisma.listing.findUnique({
        where: { id: listingId },
        select: { sellerId: true }
    });

    if (!existing || existing.sellerId !== session) {
        return { error: 'Unauthorized' };
    }

    await prisma.listing.delete({
        where: { id: listingId }
    });

    redirect('/');
}
export { analyzeListingImage, generateListingDescription, chatWithAI, searchWithAI } from './ai';
