const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkListing() {
    try {
        console.log('Checking all available listings...\n');

        const listings = await prisma.listing.findMany({
            where: { status: 'AVAILABLE' },
            select: {
                id: true,
                title: true,
                gender: true,
                category: true,
                brand: true
            }
        });

        console.log('Found listings:', listings.length);
        listings.forEach(l => {
            console.log('\n---');
            console.log('Title:', l.title);
            console.log('Gender:', l.gender, '(type:', typeof l.gender, ')');
            console.log('Category:', l.category, '(type:', typeof l.category, ')');
            console.log('Brand:', l.brand);
        });

        // Test the exact query from Discover
        console.log('\n\n=== Testing Discover Query ===');
        console.log('Searching for: gender contains "Men", category contains "Clothes"\n');

        const discoverResults = await prisma.listing.findMany({
            where: {
                status: 'AVAILABLE',
                gender: { contains: 'Men', mode: 'insensitive' },
                category: { contains: 'Clothes', mode: 'insensitive' }
            }
        });

        console.log('Discover query results:', discoverResults.length);
        if (discoverResults.length === 0) {
            console.log('❌ No results! This is why Discover shows nothing.');
        } else {
            console.log('✅ Found items:', discoverResults.map(l => l.title));
        }

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

checkListing();
