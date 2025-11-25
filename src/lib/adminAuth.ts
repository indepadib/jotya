import { getSession } from './auth';
import { prisma } from './prisma';
import { redirect } from 'next/navigation';

export async function requireAdmin() {
    const session = await getSession();
    if (!session) {
        redirect('/login');
    }

    const user = await prisma.user.findUnique({
        where: { id: session },
        select: { isAdmin: true, banned: true }
    });

    if (!user || user.banned || !user.isAdmin) {
        redirect('/');
    }

    return session;
}

export async function isAdmin(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { isAdmin: true }
    });
    return user?.isAdmin || false;
}
