import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const trackingNumber = searchParams.get('number');
    const carrier = searchParams.get('carrier') || 'AMANA';

    if (!trackingNumber) {
        return NextResponse.json({ error: 'Tracking number required' }, { status: 400 });
    }

    // Mock tracking response
    // In production, you would call Amana/Yassir APIs here

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const events = [
        {
            status: 'PICKED_UP',
            location: 'Casablanca',
            timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
            description: 'Package received by carrier'
        },
        {
            status: 'IN_TRANSIT',
            location: 'Rabat Sorting Center',
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            description: 'Processed at sorting facility'
        }
    ];

    // Add "Delivered" event if tracking number ends with 'D' (for testing)
    if (trackingNumber.endsWith('D')) {
        events.push({
            status: 'DELIVERED',
            location: 'Marrakech',
            timestamp: new Date().toISOString(),
            description: 'Delivered to recipient'
        });
    }

    return NextResponse.json({
        carrier,
        trackingNumber,
        status: trackingNumber.endsWith('D') ? 'DELIVERED' : 'IN_TRANSIT',
        estimatedDelivery: new Date(Date.now() + 86400000).toISOString(),
        events: events.reverse() // Newest first
    });
}
