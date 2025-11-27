import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const colors = await prisma.color.findMany({
            orderBy: [
                { category: 'asc' },
                { name: 'asc' },
            ],
        });

        return NextResponse.json(colors);
    } catch (error) {
        console.error('Error fetching colors:', error);
        return NextResponse.json({ error: 'Failed to fetch colors' }, { status: 500 });
    }
}
