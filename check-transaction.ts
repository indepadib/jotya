import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Checking Prisma Client Transaction Model...');

    // We can't easily check types at runtime without trying to use it or inspecting the dmmf (which is internal).
    // But we can try to create a transaction (mock) or just print the keys if possible.
    // Actually, let's just try to see if we can access the model.

    if ('transaction' in prisma) {
        console.log('SUCCESS: prisma.transaction exists');
        // Attempt a dry-run or just log that we are good.
        // We can't really check fields at runtime easily without a query.
    } else {
        console.log('FAILURE: prisma.transaction is MISSING');
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
