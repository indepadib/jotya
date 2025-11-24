'use client';

import { useState } from 'react';
import styles from './FloatingAIChat.module.css';
import OfferMessage from './OfferMessage';

export default function FloatingAIChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [messages, setMessages] = useState<Array<{
        id: string;
        type: 'text' | 'offer';
        sender: 'user' | 'ai';
        content: any;
    }>>([
        {
            id: '1',
            type: 'text',
            sender: 'ai',
            content: "Hi! I'm Jotya AI. I can help you find exactly what you're looking for."
        },
        {
            id: '2',
            type: 'text',
            sender: 'ai',
            content: 'Try asking: "Show me red Gucci bags" or "Find formal dresses under 2000 MAD"'
        }
    ]);

    const handleSend = () => {
        if (!inputValue.trim()) return;

        const newUserMsg = {
            id: Date.now().toString(),
            type: 'text' as const,
            sender: 'user' as const,
            content: inputValue
        };

        setMessages(prev => [...prev, newUserMsg]);
        setInputValue('');

        // Demo trigger for offer message
        if (inputValue.toLowerCase().includes('demo offer')) {
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                type: 'offer',
                sender: 'ai',
                content: {
                    productImage: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=400&q=60', // Optimized URL
                    productName: 'Vintage Gucci Bag',
                    price: 1500,
                    originalPrice: 2200,
                    status: 'pending'
                }
            }]);
        } else {
            // Default AI response
            setTimeout(() => {
                setMessages(prev => [...prev, {
                    id: (Date.now() + 1).toString(),
                    type: 'text',
                    sender: 'ai',
                    content: "I'm looking for that... (Try typing 'demo offer' to see the new component!)"
                }]);
            }, 1000);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSend();
    };

    return (
        <>
            {/* Floating Button */}
            <button
                className={styles.floatingButton}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Ask Jotya AI"
            >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="white" />
                    <circle cx="12" cy="12" r="2" fill="currentColor" />
                </svg>
            </button>

            {/* Chat Panel */}
            {isOpen && (
                <>
                    <div className={styles.overlay} onClick={() => setIsOpen(false)} />
                    <div className={styles.chatPanel}>
                        <div className={styles.chatHeader}>
                            <h3 className={styles.chatTitle}>Ask Jotya AI</h3>
                            <button
                                className={styles.closeButton}
                                onClick={() => setIsOpen(false)}
                                aria-label="Close"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </button>
                        </div>

                        <div className={styles.chatContent}>
                            <div className={styles.welcomeMessage}>
                                <div className={styles.aiAvatar}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor" />
                                    </svg>
                                </div>
                                <div style={{ width: '100%' }}>
                                    {messages.map((msg) => (
                                        <div key={msg.id} style={{
                                            marginBottom: '12px',
                                            display: 'flex',
                                            justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start'
                                        }}>
                                            {msg.type === 'text' ? (
                                                <div className={styles.messageBubble} style={{
                                                    background: msg.sender === 'user' ? 'var(--primary)' : 'var(--background)',
                                                    color: msg.sender === 'user' ? 'white' : 'var(--text-primary)',
                                                    border: msg.sender === 'user' ? 'none' : '1px solid var(--border)'
                                                }}>
                                                    <p style={{ color: 'inherit' }}>{msg.content}</p>
                                                </div>
                                            ) : (
                                                <div style={{ width: '85%' }}>
                                                    <OfferMessage
                                                        {...msg.content}
                                                        onAccept={() => {
                                                            setMessages(prev => prev.map(m =>
                                                                m.id === msg.id
                                                                    ? { ...m, content: { ...m.content, status: 'accepted' } }
                                                                    : m
                                                            ));
                                                        }}
                                                        onDecline={() => {
                                                            setMessages(prev => prev.map(m =>
                                                                m.id === msg.id
                                                                    ? { ...m, content: { ...m.content, status: 'rejected' } }
                                                                    : m
                                                            ));
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className={styles.chatInput}>
                            <input
                                type="text"
                                placeholder="Describe what you're looking for..."
                                className={styles.inputField}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                            />
                            <button
                                className={styles.sendButton}
                                aria-label="Send"
                                onClick={handleSend}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
