import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category') || 'clothing';
        const gender = searchParams.get('gender');
        const itemType = searchParams.get('itemType');

        const sizes = await prisma.size.findMany({
            where: {
                category,
                ...(gender && { gender: { in: [gender, 'unisex', null] } }),
                ...(itemType && { itemType: { in: [itemType, null] } }),
            },
            orderBy: [
                { sortOrder: 'asc' },
            ],
        });

        return NextResponse.json(sizes);
    } catch (error) {
        console.error('Error fetching sizes:', error);
        return NextResponse.json({ error: 'Failed to fetch sizes' }, { status: 500 });
    }
}
