'use server';

import { ai } from '@/lib/ai';
import { prisma } from '@/lib/prisma';

import { searchListings } from './search';

export async function chatWithAI(message: string) {
    try {
        console.log('[chatWithAI] Starting request with message:', message);

        // 1. First, let's try to understand if this is a search query
        const completion = await ai.chat.completions.create({
            model: 'gpt-4o-mini', // Fast and cheap OpenAI model
            messages: [
                {
                    role: 'system',
                    content: `You are Jotya AI, a helpful shopping assistant for a Moroccan luxury marketplace. 
          Your goal is to help users find items or answer questions about the platform.
          
          If the user is looking for a product, extract the search criteria.
          Return a JSON object with "type": "search" and the criteria:
          - query (string): general keywords (e.g. "bag", "t-shirt", "dress")
          - brand (string, optional)
          - category (string, optional)
          - color (string, optional)
          - maxPrice (number, optional)
          
          Example: "Find me a red Gucci bag under 2000" -> {"type": "search", "criteria": {"query": "bag", "brand": "Gucci", "category": "Bags", "color": "Red", "maxPrice": 2000}}
          Example: "Show me tommy t-shirt" -> {"type": "search", "criteria": {"query": "t-shirt", "brand": "Tommy Hilfiger"}}
          
          If it's a general question, answer it politely and briefly. Return {"type": "text", "message": "your answer"}.
          
          Keep answers concise and helpful. The currency is MAD (Moroccan Dirham).`
                },
                { role: 'user', content: message }
            ],
            response_format: { type: 'json_object' }
        });

        console.log('[chatWithAI] Got completion from AI');

        const responseContent = completion.choices[0].message.content;
        if (!responseContent) {
            console.error('[chatWithAI] No response content from AI');
            throw new Error('No response from AI');
        }

        console.log('[chatWithAI] Response content:', responseContent);

        const result = JSON.parse(responseContent);
        console.log('[chatWithAI] Parsed result:', result);

        // 2. If it's a search, let's actually search the database
        if (result.type === 'search') {
            console.log('[chatWithAI] Processing search request with criteria:', result.criteria);
            const { criteria } = result;

            // Strategy 1: Strict Search (Query + Brand + Category etc.)
            let listings = await searchListings({
                query: criteria.query,
                brand: criteria.brand,
                category: criteria.category,
                color: criteria.color,
                maxPrice: criteria.maxPrice
            });

            let searchMessage = `I found ${listings.length} items matching your search!`;

            // Strategy 2: Fallback - If no results, try relaxing the query
            if (listings.length === 0) {
                console.log('[chatWithAI] Strict search failed. Trying fallbacks...');

                // 2a. If we have a brand, try showing everything from that brand
                if (criteria.brand) {
                    console.log('[chatWithAI] Fallback: Searching brand only:', criteria.brand);
                    const brandListings = await searchListings({ brand: criteria.brand });

                    if (brandListings.length > 0) {
                        listings = brandListings;
                        searchMessage = `I couldn't find exactly "${criteria.query || ''}" from ${criteria.brand}, but here are other items from this brand you might like:`;
                    }
                }

                // 2b. If still no results (or no brand), try searching just the keywords (ignoring category/brand constraints if they were strict)
                if (listings.length === 0 && criteria.query) {
                    console.log('[chatWithAI] Fallback: Searching keywords only:', criteria.query);
                    // Try to broaden terms: "t-shirt" -> "shirt"
                    const broadQuery = criteria.query.replace('t-shirt', 'shirt').replace('sneakers', 'shoes');

                    const keywordListings = await searchListings({ query: broadQuery });

                    if (keywordListings.length > 0) {
                        listings = keywordListings;
                        searchMessage = `I couldn't find exact matches, but here are some similar items matching "${broadQuery}":`;
                    }
                }
            }

            console.log('[chatWithAI] Final listings count:', listings.length);

            // Take top 3 for chat
            const topListings = listings.slice(0, 3);

            return {
                type: 'search_results',
                message: topListings.length > 0
                    ? searchMessage
                    : "I couldn't find anything matching that right now. Try searching for a different brand or category!",
                items: topListings.map(l => ({
                    id: l.id,
                    title: l.title,
                    price: l.price,
                    image: JSON.parse(l.images)[0],
                    brand: l.brand
                }))
            };
        }

        console.log('[chatWithAI] Returning text response');
        return {
            type: 'text',
            message: result.message
        };

    } catch (error) {
        console.error('[chatWithAI] ERROR:', error);
        console.error('[chatWithAI] Error stack:', error instanceof Error ? error.stack : 'No stack trace');

        // Check if it's a rate limit error
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes('429') || errorMessage.includes('Rate limit')) {
            return {
                type: 'text',
                message: "I'm temporarily unavailable due to high demand. Please try again in a few moments, or contact support if this persists."
            };
        }

        return {
            type: 'text',
            message: "I'm having a little trouble connecting right now. Please try again in a moment!"
        };
    }
}

export async function searchWithAI(query: string) {
    try {
        const completion = await ai.chat.completions.create({
            model: 'gpt-4o-mini',
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
        console.log('[AI] Generating description...');

        // Case 1: Input is an object (Metadata for text generation)
        if (typeof input === 'object') {
            console.log('[AI] Mode: Text Generation');
            // ... existing code ...
        }

        // Case 2: Input is a string (Image Base64 for analysis)
        console.log('[AI] Mode: Image Analysis');

        // Fetch reference data to guide the AI
        const [brands, colors] = await Promise.all([
            prisma.brand.findMany({ select: { id: true, name: true } }),
            prisma.color.findMany({ select: { id: true, name: true } })
        ]);
        console.log(`[AI] Loaded ${brands.length} brands and ${colors.length} colors for context.`);

        const brandList = brands.map(b => b.name).join(', ');
        const colorList = colors.map(c => c.name).join(', ');

        const prompt = type === 'label'
            ? `Analyze this fashion item label. Is it authentic? 
               Valid Brands: ${brandList}
               Return JSON with { isAuthentic: boolean, brand: string, checks: [{name: string, passed: boolean}] }
               If the brand matches one in the list, use the exact name.`
            : `You are a fashion expert. Analyze the image and generate a listing description for a marketplace.
          
          Context:
          - Valid Brands: ${brandList}
          - Valid Colors: ${colorList}
          
          Instructions:
          - Identify the brand. If it matches a Valid Brand, use that EXACT name. If not, use the detected name.
          - Identify the dominant color. Map it to the closest Valid Color.
          - Determine the Gender (Men, Women, Kids, Unisex).
          - Determine the Category (Clothing, Shoes, Accessories, Bags).
          - Determine the specific Item Type (e.g., T-Shirt, Jeans, Sneakers, Handbag).
          
          Return a JSON object with:
          - title (string): A catchy, descriptive title
          - description (string): A detailed description including color, style, and potential condition
          - gender (string): Men, Women, Kids, or Unisex
          - category (string): Clothing, Shoes, Accessories, or Bags
          - itemType (string): The specific type
          - brand (string, optional): The detected brand name
          - color (string): The detected color name
          - material (string, optional)
          - style (string, optional)
          - fit (string, optional)
          `;

        console.log('[AI] Sending request to OpenAI...');
        const completion = await ai.chat.completions.create({
            model: 'gpt-4o-mini',
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

        console.log('[AI] Received response:', content);

        const result = JSON.parse(content);

        // Post-processing: Map to IDs
        if (result.brand) {
            const detectedBrand = result.brand.toLowerCase();

            // 1. Exact match
            let matchedBrand = brands.find(b => b.name.toLowerCase() === detectedBrand);

            // 2. Partial match (AI result contains DB brand, e.g. "Nike Air" -> "Nike")
            if (!matchedBrand) {
                matchedBrand = brands.find((b: { name: string; id: string }) => detectedBrand.includes(b.name.toLowerCase()));
            }

            // 3. Reverse partial match (DB brand contains AI result, e.g. "Zara" -> "Zara Home")
            if (!matchedBrand) {
                matchedBrand = brands.find((b: { name: string; id: string }) => b.name.toLowerCase().includes(detectedBrand));
            }

            if (matchedBrand) {
                result.brandId = matchedBrand.id;
                result.brand = matchedBrand.name; // Normalize to our name
            }
        }

        if (result.color) {
            const matchedColor = colors.find(c => c.name.toLowerCase() === result.color.toLowerCase());
            if (matchedColor) {
                result.colorId = matchedColor.id;
                result.color = matchedColor.name; // Normalize to our name
            }
        }

        return result;
    } catch (error) {
        console.error('AI Description Error:', error);
        if (error instanceof Error) console.error('Stack:', error.stack);
        return null;
    }
}

export const analyzeListingImage = generateListingDescription;

