import { PrismaClient } from '@prisma/client';
import { brands } from './brands';
import { colors } from './colors';
import { sizes } from './sizes';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seeding...');

    // Seed Brands
    console.log('📦 Seeding brands...');
    let brandCount = 0;
    for (const brand of brands) {
        await prisma.brand.upsert({
            where: { slug: brand.slug },
            update: brand,
            create: brand,
        });
        brandCount++;
    }
    console.log(`✅ Seeded ${brandCount} brands`);

    // Seed Colors
    console.log('🎨 Seeding colors...');
    let colorCount = 0;
    for (const color of colors) {
        await prisma.color.upsert({
            where: { name: color.name },
            update: color,
            create: color,
        });
        colorCount++;
    }
    console.log(`✅ Seeded ${colorCount} colors`);

    // Seed Sizes
    console.log('📏 Seeding sizes...');
    let sizeCount = 0;
    for (const size of sizes) {
        // Find existing size with same unique constraint
        const existing = await prisma.size.findFirst({
            where: {
                value: size.value,
                system: size.system,
                category: size.category,
                gender: size.gender,
                itemType: size.itemType,
            },
        });

        if (existing) {
            await prisma.size.update({
                where: { id: existing.id },
                data: size,
            });
        } else {
            await prisma.size.create({
                data: size,
            });
        }
        sizeCount++;
    }
    console.log(`✅ Seeded ${sizeCount} sizes`);

    console.log('🎉 Database seeding completed successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
