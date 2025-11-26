'use server';

import { ai } from '@/lib/ai';
import { prisma } from '@/lib/prisma';

export async function chatWithAI(message: string) {
    try {
        // 1. First, let's try to understand if this is a search query
        const completion = await ai.chat.completions.create({
            model: 'google/gemini-2.0-flash-exp:free',
            messages: [
                {
                    role: 'system',
                    content: `You are Jotya AI, a helpful shopping assistant for a Moroccan luxury marketplace. 
          Your goal is to help users find items or answer questions about the platform.
          
          If the user is looking for a product, extract the search criteria (brand, category, color, maxPrice) and return a JSON object with "type": "search" and the criteria.
          Example: "Find me a red Gucci bag under 2000" -> {"type": "search", "criteria": {"brand": "Gucci", "category": "Bags", "color": "Red", "maxPrice": 2000}}
          
          If it's a general question, answer it politely and briefly. Return {"type": "text", "message": "your answer"}.
          
          Keep answers concise and helpful. The currency is MAD (Moroccan Dirham).`
                },
                { role: 'user', content: message }
            ],
            response_format: { type: 'json_object' }
        });

        const responseContent = completion.choices[0].message.content;
        if (!responseContent) throw new Error('No response from AI');

        const result = JSON.parse(responseContent);

        // 2. If it's a search, let's actually search the database
        if (result.type === 'search') {
            const { criteria } = result;

            const where: any = { status: 'AVAILABLE' };
            if (criteria.brand) where.brand = { contains: criteria.brand, mode: 'insensitive' };
            if (criteria.category) where.category = { contains: criteria.category, mode: 'insensitive' };
            if (criteria.maxPrice) where.price = { lte: criteria.maxPrice };

            const listings = await prisma.listing.findMany({
                where,
                take: 3,
                orderBy: { createdAt: 'desc' }
            });

            return {
                type: 'search_results',
                message: listings.length > 0
                    ? `I found ${listings.length} items matching your search!`
                    : "I couldn't find exactly that, but here are some other items you might like.",
                items: listings.map(l => ({
                    id: l.id,
                    title: l.title,
                    price: l.price,
                    image: JSON.parse(l.images)[0],
                    brand: l.brand
                }))
            };
        }

        return {
            type: 'text',
            message: result.message
        };

    } catch (error) {
        console.error('AI Error:', error);
        return {
            type: 'text',
            message: "I'm having a little trouble connecting right now. Please try again in a moment!"
        };
    }
}

export async function searchWithAI(query: string) {
    try {
        const completion = await ai.chat.completions.create({
            model: 'google/gemini-2.0-flash-exp:free',
            messages: [
                {
                    role: 'system',
                    content: `You are a search assistant for a marketplace. Extract search filters from the user's query.
          Return a JSON object with:
          - keywords (string): main search terms
          - minPrice (number, optional)
          - maxPrice (number, optional)
          - category (string, optional)
          - brand (string, optional)
          
          Example: "red gucci bag under 2000" -> {"keywords": "red bag", "brand": "Gucci", "maxPrice": 2000, "category": "Bags"}
          `
                },
                { role: 'user', content: query }
            ],
            response_format: { type: 'json_object' }
        });

        const content = completion.choices[0].message.content;
        if (!content) throw new Error('No response');

        return JSON.parse(content);
    } catch (error) {
        console.error('AI Search Error:', error);
        return { keywords: query }; // Fallback to simple search
    }
}

export async function generateListingDescription(input: string | any, type?: 'general' | 'label') {
    try {
        // Case 1: Input is an object (Metadata for text generation)
        if (typeof input === 'object') {
            const completion = await ai.chat.completions.create({
                model: 'google/gemini-2.0-flash-exp:free',
                messages: [
                    {
                        role: 'system',
                        content: `You are a professional copywriter for a luxury marketplace. Write a compelling, SEO-friendly product description based on the provided details.
            Keep it under 150 words. Focus on style, condition, and key features.
            Return just the description text, no JSON.`
                    },
                    {
                        role: 'user',
                        content: `Write a description for this item: ${JSON.stringify(input)}`
                    }
                ]
            });
            return completion.choices[0].message.content;
        }

        // Case 2: Input is a string (Image Base64 for analysis)
        const prompt = type === 'label'
            ? "Analyze this fashion item label. Is it authentic? Return JSON with { isAuthentic: boolean, brand: string, checks: [{name: string, passed: boolean}] }"
            : `You are a fashion expert. Analyze the image and generate a listing description for a marketplace.
          Return a JSON object with:
          - title (string): A catchy, descriptive title
          - description (string): A detailed description including color, style, and potential condition
          - category (string): The most likely category
          - brand (string, optional): If a logo is visible
          - color (string): The dominant color
          - material (string, optional)
          - style (string, optional)
          - fit (string, optional)
          `;

        const completion = await ai.chat.completions.create({
            model: 'google/gemini-2.0-flash-exp:free',
            messages: [
                {
                    role: 'system',
                    content: prompt
                },
                {
                    role: 'user',
                    content: [
                        { type: "text", text: "Analyze this item." },
                        { type: "image_url", image_url: { url: input } }
                    ]
                }
            ],
            response_format: { type: 'json_object' }
        });

        const content = completion.choices[0].message.content;
        if (!content) throw new Error('No response');

        return JSON.parse(content);
    } catch (error) {
        console.error('AI Description Error:', error);
        return null;
    }
}

export const analyzeListingImage = generateListingDescription;

