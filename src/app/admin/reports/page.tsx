import { requireAdmin } from '@/lib/adminAuth';
import { prisma } from '@/lib/prisma';
import ReportsClient from './ReportsClient';

export default async function ReportsPage() {
    await requireAdmin();

    const reports = await prisma.report.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            reporter: { select: { name: true, email: true } },
            reported: { select: { name: true, email: true } },
            listing: { select: { title: true } }
        }
    });

    return <ReportsClient reports={reports} />;
}
