import OpenAI from 'openai';

if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('Missing OPENROUTER_API_KEY environment variable');
}

export const ai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
    defaultHeaders: {
        'HTTP-Referer': 'https://jotya.com', // Optional, for including your app on openrouter.ai rankings.
        'X-Title': 'Jotya Marketplace', // Optional. Shows in rankings on openrouter.ai.
    },
});
