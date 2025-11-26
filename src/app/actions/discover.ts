'use server';

import { prisma } from '@/lib/prisma';
import { ai } from '@/lib/ai';
import { searchListings } from './search';

// Fetch initial random items for a category
export async function getInitialItems(gender: string, category: string) {
    try {
        const where: any = {
            status: 'AVAILABLE',
        };

        if (gender && gender !== 'all') where.gender = gender;
        if (category && category !== 'all') where.category = category;

        // Get 20 random items (simulated by taking latest for now, or random skip if we had many)
        // For MVP, just take latest 20
        const listings = await prisma.listing.findMany({
            where,
            take: 20,
            orderBy: { createdAt: 'desc' },
            include: { seller: { select: { name: true, rating: true } } }
        });

        // Shuffle them for "randomness"
        return listings.sort(() => Math.random() - 0.5);
    } catch (error) {
        console.error('Error fetching initial items:', error);
        return [];
    }
}

// Generate recommendations based on liked items
export async function getRecommendedItems(likedItemIds: string[]) {
    try {
        if (likedItemIds.length === 0) return [];

        // 1. Fetch details of liked items to understand user taste
        const likedItems = await prisma.listing.findMany({
            where: { id: { in: likedItemIds } },
            select: { title: true, brand: true, category: true, color: true }
        });

        // 2. Ask AI to analyze taste and generate a search query
        const completion = await ai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `You are a fashion stylist AI. Analyze the items the user liked and generate a search query for the next batch of items.
                    
                    Liked Items: ${JSON.stringify(likedItems)}
                    
                    Return a JSON object with:
                    - query (string): keywords (e.g. "vintage oversized hoodie")
                    - brand (string, optional): if they seem to like a specific brand
                    - category (string, optional)
                    - color (string, optional)
                    
                    Focus on the COMMON patterns. If they like mixed things, pick the most prominent style.`
                }
            ],
            response_format: { type: 'json_object' }
        });

        const content = completion.choices[0].message.content;
        if (!content) return [];
        const criteria = JSON.parse(content);

        console.log('[Discover] AI Recommendation Criteria:', criteria);

        // 3. Search using the AI's criteria
        const recommendations = await searchListings({
            query: criteria.query,
            brand: criteria.brand,
            category: criteria.category,
            color: criteria.color
        });

        // Filter out items they've already liked (client-side usually handles seen, but good to be safe)
        return recommendations.filter(item => !likedItemIds.includes(item.id)).slice(0, 10);

    } catch (error) {
        console.error('Error getting recommendations:', error);
        return [];
    }
}
