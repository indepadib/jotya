
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Starting migration of legacy listing data...');

    // 1. Fetch all reference data
    const brands = await prisma.brand.findMany();
    const colors = await prisma.color.findMany();
    const sizes = await prisma.size.findMany();

    console.log(`📚 Loaded reference data: ${brands.length} brands, ${colors.length} colors, ${sizes.length} sizes.`);

    // 2. Fetch listings that need migration (where IDs are null but text fields exist)
    const listings = await prisma.listing.findMany({
        where: {
            OR: [
                { brandId: null, brand: { not: null } },
                { colorId: null, color: { not: null } },
                { sizeId: null, size: { not: null } }
            ]
        }
    });

    console.log(`📦 Found ${listings.length} listings to migrate.`);

    let updatedCount = 0;
    let errors = 0;

    for (const listing of listings) {
        try {
            const updates: any = {};
            let hasUpdates = false;

            // --- BRAND MAPPING ---
            if (!listing.brandId && listing.brand) {
                // Try exact match
                let brandMatch = brands.find(b => b.name.toLowerCase() === listing.brand!.toLowerCase());

                // Try partial match if exact fails
                if (!brandMatch) {
                    brandMatch = brands.find(b => listing.brand!.toLowerCase().includes(b.name.toLowerCase()));
                }

                if (brandMatch) {
                    updates.brandId = brandMatch.id;
                    hasUpdates = true;
                    // console.log(`✅ Brand matched: "${listing.brand}" -> ${brandMatch.name}`);
                } else {
                    // console.log(`⚠️ Brand NOT matched: "${listing.brand}"`);
                }
            }

            // --- COLOR MAPPING ---
            if (!listing.colorId && listing.color) {
                // Try exact match
                let colorMatch = colors.find(c => c.name.toLowerCase() === listing.color!.toLowerCase());

                // Try partial match
                if (!colorMatch) {
                    colorMatch = colors.find(c => listing.color!.toLowerCase().includes(c.name.toLowerCase()));
                }

                if (colorMatch) {
                    updates.colorId = colorMatch.id;
                    hasUpdates = true;
                    // console.log(`✅ Color matched: "${listing.color}" -> ${colorMatch.name}`);
                }
            }

            // --- SIZE MAPPING ---
            if (!listing.sizeId && listing.size) {
                // Size matching is trickier. Try to match the 'value'
                // We might need to consider category/gender if available on the listing
                // For now, let's try to match the value exactly

                const sizeMatch = sizes.find(s => s.value.toLowerCase() === listing.size!.toLowerCase());

                if (sizeMatch) {
                    updates.sizeId = sizeMatch.id;
                    hasUpdates = true;
                    // console.log(`✅ Size matched: "${listing.size}" -> ${sizeMatch.value} (${sizeMatch.system})`);
                }
            }

            // --- APPLY UPDATES ---
            if (hasUpdates) {
                await prisma.listing.update({
                    where: { id: listing.id },
                    data: updates
                });
                updatedCount++;
                process.stdout.write('.'); // Progress indicator
            }

        } catch (error) {
            console.error(`\n❌ Error updating listing ${listing.id}:`, error);
            errors++;
        }
    }

    console.log(`\n\n🎉 Migration complete!`);
    console.log(`✅ Updated: ${updatedCount} listings`);
    console.log(`❌ Errors: ${errors}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
