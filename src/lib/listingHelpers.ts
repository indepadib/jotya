import { prisma } from '@/lib/prisma';

/**
 * Check if a value is likely a database ID (cuid format)
 */
export function isDatabaseId(value: string | null): boolean {
    if (!value) return false;
    // CUIDs are exactly 25 chars starting with 'c'
    return value.length === 25 && /^c[a-z0-9]{24}$/i.test(value);
}

/**
 * Lookup brand/color/size by ID if the field contains a database ID
 */
export async function lookupListingReferences(listing: any) {
    const brandName = listing.brandRef?.name
        || (listing.brand && isDatabaseId(listing.brand)
            ? (await prisma.brand.findUnique({ where: { id: listing.brand } }))?.name
            : listing.brand);

    const colorName = listing.colorRef?.name
        || (listing.color && isDatabaseId(listing.color)
            ? (await prisma.color.findUnique({ where: { id: listing.color } }))?.name
            : listing.color);

    const sizeValue = listing.sizeRef?.value
        || (listing.size && isDatabaseId(listing.size)
            ? (await prisma.size.findUnique({ where: { id: listing.size } }))?.value
            : listing.size);

    return {
        ...listing,
        displayBrand: brandName,
        displayColor: colorName,
        displaySize: sizeValue
    };
}

/**
 * Lookup references for multiple listings in parallel
 */
export async function lookupListingsReferences(listings: any[]) {
    return Promise.all(listings.map(listing => lookupListingReferences(listing)));
}
