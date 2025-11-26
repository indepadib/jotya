const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkListings() {
    try {
        console.log('Checking listings...');
        const listings = await prisma.listing.findMany({
            where: { status: 'AVAILABLE' },
            select: { id: true, title: true, description: true, brand: true, category: true }
        });

        console.log('Found listings:', listings);

        // Test the search logic manually
        const query = "t-shirt";
        const brand = "tommy";

        console.log(`\nTesting search for query="${query}" and brand="${brand}"...`);

        const matches = listings.filter(l => {
            const textMatch = (l.title.toLowerCase().includes(query) || l.description.toLowerCase().includes(query));
            const brandMatch = l.brand.toLowerCase().includes(brand);
            return textMatch && brandMatch;
        });

        console.log('Manual match result:', matches);

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

checkListings();
