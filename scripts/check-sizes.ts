
import { prisma } from '../src/lib/prisma';

async function main() {
    const sizes = await prisma.size.findMany({
        take: 20,
        select: { system: true, value: true }
    });
    console.log('Sample sizes:', sizes);

    const systems = await prisma.size.groupBy({
        by: ['system'],
        _count: true
    });
    console.log('Systems:', systems);
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
