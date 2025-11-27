import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category') || 'clothing';
        const gender = searchParams.get('gender');
        const itemType = searchParams.get('itemType');

        // Build gender array - filter out null/undefined and include matching options
        const genderArray: string[] = [];
        if (gender) {
            genderArray.push(gender);
            genderArray.push('unisex');
        }

        // Build itemType array - filter out null/undefined
        const itemTypeArray: string[] = [];
        if (itemType) {
            itemTypeArray.push(itemType);
        }

        const sizes = await prisma.size.findMany({
            where: {
                category,
                ...(genderArray.length > 0 && {
                    OR: [
                        { gender: { in: genderArray } },
                        { gender: null }
                    ]
                }),
                ...(itemTypeArray.length > 0 && {
                    OR: [
                        { itemType: { in: itemTypeArray } },
                        { itemType: null }
                    ]
                }),
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
