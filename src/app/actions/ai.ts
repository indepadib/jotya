'use server';

import { analyzeImage } from '@/lib/ai';

export async function analyzeListingImage(base64Image: string, imageType: 'general' | 'label' = 'general') {
    try {
        const result = await analyzeImage(base64Image, imageType);
        return result;
    } catch (error) {
        console.error('AI Analysis failed:', error);
        return null;
    }
}

export async function generateListingDescription(details: { brand: string; color: string; category: string; title: string; material?: string; style?: string; fit?: string }) {
    try {
        // Import dynamically to avoid circular deps if any (though none here)
        const { generateDescription } = await import('@/lib/ai');
        return await generateDescription(details);
    } catch (error) {
        console.error('AI Description failed:', error);
        return null;
    }
}
