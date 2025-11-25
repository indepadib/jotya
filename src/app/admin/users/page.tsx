import { requireAdmin } from '@/lib/adminAuth';
import { prisma } from '@/lib/prisma';
import UserManagementClient from './UserManagementClient';

export default async function UsersPage() {
    await requireAdmin();

    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            listings: { where: { status: 'AVAILABLE' } },
            sales: true,
            _count: {
                select: {
                    listings: true,
                    sales: true,
                    purchases: true
                }
            }
        }
    });

    return <UserManagementClient users={users} />;
}
