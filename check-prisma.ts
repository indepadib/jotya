import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Checking Prisma Client...');
    if ('favorite' in prisma) {
        console.log('SUCCESS: prisma.favorite exists');
    } else {
        console.log('FAILURE: prisma.favorite is MISSING');
        console.log('Available models:', Object.keys(prisma).filter(k => !k.startsWith('_')));
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
