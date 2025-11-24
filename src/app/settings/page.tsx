import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import SettingsView from './SettingsView';

export default async function SettingsPage() {
    const session = await getSession();
    if (!session) redirect('/login');

    const user = await prisma.user.findUnique({
        where: { id: session },
        select: {
            id: true,
            name: true,
            email: true,
            image: true,
            // We don't need other fields for settings
        }
    });

    if (!user) redirect('/login');

    return <SettingsView user={user} />;
}
