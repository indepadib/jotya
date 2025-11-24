'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function releaseMockFunds() {
    const session = await getSession();
    if (!session) throw new Error('Unauthorized');

    const wallet = await prisma.wallet.findUnique({
        where: { userId: session }
    });

    if (!wallet || wallet.pending <= 0) return;

    // Move all pending to balance
    await prisma.wallet.update({
        where: { userId: session },
        data: {
            balance: { increment: wallet.pending },
            pending: 0
        }
    });

    revalidatePath('/wallet');
}
