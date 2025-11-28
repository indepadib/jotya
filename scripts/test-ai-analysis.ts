import { generateListingDescription, chatWithAI } from '../src/app/actions/ai';

async function main() {
    console.log('🧪 Testing AI Analysis...');

    // 1. Test Image Analysis
    const imageUrl = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80';

    try {
        console.log('\n--- Testing Image Analysis ---');
        const result = await generateListingDescription(imageUrl, 'general');
        console.log('✅ Image Analysis Result:', JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('❌ Image Analysis Error:', error);
    }

    // 2. Test Chat
    try {
        console.log('\n--- Testing Chat ---');
        const chatResult = await chatWithAI("Find me a red nike bag");
        console.log('✅ Chat Result:', JSON.stringify(chatResult, null, 2));
    } catch (error) {
        console.error('❌ Chat Error:', error);
    }
}

main();
