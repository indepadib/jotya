import { prisma } from '@/lib/prisma';

export type NotificationType =
    | 'NEW_MESSAGE'
    | 'OFFER_RECEIVED'
    | 'OFFER_ACCEPTED'
    | 'OFFER_REJECTED'
    | 'ITEM_SOLD'
    | 'PAYMENT_RECEIVED'
    | 'PAYOUT_PROCESSED'
    | 'ITEM_SHIPPED'
    | 'ITEM_DELIVERED';

/**
 * Create a notification for a user
 */
export async function createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    link?: string
) {
    try {
        await prisma.notification.create({
            data: {
                userId,
                type: type as any,
                title,
                message,
                link
            }
        });
    } catch (error) {
        console.error('Error creating notification:', error);
    }
}
