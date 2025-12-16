// Quick script to check database images format
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkImages() {
    try {
        const listings = await prisma.listing.findMany({
            select: {
                id: true,
                title: true,
                images: true,
                createdAt: true
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 5
        });

        console.log('\n=== Recent Listings Images ===\n');

        for (const listing of listings) {
            console.log(`\nListing: ${listing.title}`);
            console.log(`Created: ${listing.createdAt}`);

            try {
                const images = JSON.parse(listing.images);
                console.log(`Number of images: ${images.length}`);

                if (images.length > 0) {
                    const firstImage = images[0];
                    if (firstImage.startsWith('data:image')) {
                        console.log(`✅ Base64 image (${firstImage.length} chars)`);
                    } else if (firstImage.includes('supabase')) {
                        console.log(`❌ Supabase URL: ${firstImage.substring(0, 80)}...`);
                    } else {
                        console.log(`❓ Unknown format: ${firstImage.substring(0, 80)}...`);
                    }
                }
            } catch (e) {
                console.log(`⚠️  Invalid JSON: ${listing.images.substring(0, 50)}`);
            }
        }

        console.log('\n');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkImages();
