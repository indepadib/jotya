'use server';

import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { sendMessageNotification } from '@/lib/email';
import { createNotification } from '@/lib/notifications';

export async function startConversation(formData: FormData) {
    const session = (await cookies()).get('session')?.value;
    if (!session) redirect('/login');

    const listingId = formData.get('listingId') as string;
    const sellerId = formData.get('sellerId') as string;

    if (session === sellerId) {
        // For testing, we might want to allow this or just redirect to inbox
        redirect('/inbox');
    }

    // Check if existing conversation (transaction/message thread) exists
    // For MVP, we use the Transaction model as a "Conversation Context" if needed, 
    // or just query messages between these two users for this listing.

    // Let's check if there are already messages for this listing between these users
    const existingMessage = await prisma.message.findFirst({
        where: {
            listingId,
            OR: [
                { senderId: session, receiverId: sellerId },
                { senderId: sellerId, receiverId: session },
            ],
        },
    });

    // If no message, we can just redirect to the chat room. 
    // The chat room will be identified by the OTHER user's ID (and optionally listing ID).
    // For simplicity, let's redirect to /inbox/[otherUserId]?listingId=...

    redirect(`/inbox/${sellerId}?listingId=${listingId}`);
}

export async function sendMessage(receiverId: string, content: string, listingId?: string) {
    const session = (await cookies()).get('session')?.value;
    if (!session) return { error: 'Unauthorized' };

    if (!content || !receiverId) return { error: 'Missing fields' };

    await prisma.message.create({
        data: {
            content,
            senderId: session,
            receiverId,
            listingId: listingId || undefined,
        },
    });

    // Get sender and receiver info
    const [sender, receiver] = await Promise.all([
        prisma.user.findUnique({ where: { id: session }, select: { name: true } }),
        prisma.user.findUnique({ where: { id: receiverId }, select: { email: true } })
    ]);

    const senderName = sender?.name || 'Someone';

    // Send email notification
    if (receiver?.email) {
        await sendMessageNotification(
            receiver.email,
            senderName,
            content.substring(0, 100)
        );
    }

    // Create in-app notification
    await createNotification(
        receiverId,
        'NEW_MESSAGE',
        'New Message',
        `${senderName} sent you a message`,
        `/inbox/${session}`
    );

    return { success: true };
}

export async function getConversations() {
    const session = (await cookies()).get('session')?.value;
    if (!session) return [];

    // This is a bit complex in SQL/Prisma to get "latest message per user".
    // Simplified approach: Get all messages involved, then group by user in JS.
    const messages = await prisma.message.findMany({
        where: {
            OR: [{ senderId: session }, { receiverId: session }],
        },
        include: {
            sender: { select: { id: true, name: true, image: true } },
            receiver: { select: { id: true, name: true, image: true } },
            listing: { select: { title: true } },
        },
        orderBy: { createdAt: 'desc' },
    });

    const conversations = new Map();

    messages.forEach(msg => {
        const otherUser = msg.senderId === session ? msg.receiver : msg.sender;
        if (!conversations.has(otherUser.id)) {
            conversations.set(otherUser.id, {
                user: otherUser,
                lastMessage: msg,
            });
        }
    });

    return Array.from(conversations.values());
}

export async function getMessages(otherUserId: string) {
    const session = (await cookies()).get('session')?.value;
    if (!session) return [];

    return await prisma.message.findMany({
        where: {
            OR: [
                { senderId: session, receiverId: otherUserId },
                { senderId: otherUserId, receiverId: session },
            ],
        },
        orderBy: { createdAt: 'asc' },
        include: {
            listing: {
                select: {
                    id: true,
                    title: true,
                    images: true,
                    price: true,
                    status: true // Add status to check if item is sold
                }
            }
        }
    });
}
