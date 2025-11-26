import { NextResponse } from 'next/server';
import { ai } from '@/lib/ai';



export async function GET() {
    try {
        console.log('Testing OpenAI connection...');
        console.log('API Key:', process.env.OPENAI_API_KEY ? 'Present' : 'Missing');

        const completion = await ai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful assistant.'
                },
                {
                    role: 'user',
                    content: 'Say "Hello from Jotya AI!"'
                }
            ]
        });

        const response = completion.choices[0].message.content;

        return NextResponse.json({
            success: true,
            message: response,
            model: completion.model
        });
    } catch (error: any) {
        console.error('AI Test Error:', error);
        return NextResponse.json({
            success: false,
            error: error.message,
            details: error.toString()
        }, { status: 500 });
    }
}
