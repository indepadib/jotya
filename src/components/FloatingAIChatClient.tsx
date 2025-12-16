'use client';

import dynamic from 'next/dynamic';

// Lazy load FloatingAIChat only on client-side
const FloatingAIChat = dynamic(
    () => import('@/components/AI/FloatingAIChat'),
    {
        ssr: false,
        loading: () => null
    }
);

export default function FloatingAIChatClient() {
    return <FloatingAIChat />;
}
