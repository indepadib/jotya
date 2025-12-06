import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { createNotification } from '@/lib/notifications';

// GET - Fetch user notifications
export async function GET() {
    try {
        const session = (await cookies()).get('session')?.value;
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const notifications = await prisma.notification.findMany({
            where: { userId: session },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });

        const unreadCount = await prisma.notification.count({
            where: {
                userId: session,
                read: false
            }
        });

        return NextResponse.json({ notifications, unreadCount });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
    }
}

// PUT - Mark notifications as read
export async function PUT(request: NextRequest) {
    try {
        const session = (await cookies()).get('session')?.value;
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { notificationIds, markAllAsRead } = body;

        if (markAllAsRead) {
            await prisma.notification.updateMany({
                where: {
                    userId: session,
                    read: false
                },
                data: { read: true }
            });
        } else if (notificationIds && Array.isArray(notificationIds)) {
            await prisma.notification.updateMany({
                where: {
                    id: { in: notificationIds },
                    userId: session
                },
                data: { read: true }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating notifications:', error);
        return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 });
    }
}
