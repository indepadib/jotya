'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// Get count of unread messages for current user
export async function getUnreadMessageCount() {
    try {
        const session = await getSession();
        if (!session) return 0;

        const count = await prisma.message.count({
            where: {
                receiverId: session,
                read: false
            }
        });

        return count;
    } catch (error) {
        console.error('Error getting unread message count:', error);
        return 0;
    }
}

// Mark a message as read
export async function markMessageAsRead(messageId: string) {
    try {
        const session = await getSession();
        if (!session) return { success: false };

        await prisma.message.update({
            where: {
                id: messageId,
                receiverId: session // Ensure user is the receiver
            },
            data: {
                read: true,
                readAt: new Date()
            }
        });

        return { success: true };
    } catch (error) {
        console.error('Error marking message as read:', error);
        return { success: false };
    }
}

// Mark all messages in a conversation as read
export async function markConversationAsRead(otherUserId: string) {
    try {
        const session = await getSession();
        if (!session) return { success: false };

        await prisma.message.updateMany({
            where: {
                receiverId: session,
                senderId: otherUserId,
                read: false
            },
            data: {
                read: true,
                readAt: new Date()
            }
        });

        return { success: true };
    } catch (error) {
        console.error('Error marking conversation as read:', error);
        return { success: false };
    }
}
