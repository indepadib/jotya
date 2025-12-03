'use client';

import { useState, useEffect, useRef, use } from 'react';
import { getMessages, sendMessage } from '@/app/actions/chat';
import { respondToOffer } from '@/app/actions/offer';
import { markConversationAsRead } from '@/app/actions/notifications';

import styles from './chat.module.css';
import Link from 'next/link';

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [sending, setSending] = useState(false);

    // In a real app, get current user from session
    // For now, we'll rely on the server action to handle the sender ID based on session

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const data = await getMessages(id);
                setMessages(data);
                setLoading(false);
                scrollToBottom();
            } catch (error) {
                console.error('Error loading messages:', error);
                setLoading(false);
                // Set empty array so user can at least see the chat interface
                setMessages([]);
            }
        };

        fetchMessages();

        // Mark messages as read when opening conversation (non-blocking)
        markConversationAsRead(id).catch(err =>
            console.error('Error marking as read:', err)
        );

        // Poll for new messages every 3 seconds
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);
    }, [id]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        setSending(true);
        const content = newMessage;
        setNewMessage(''); // Optimistic clear

        // Optimistic add (optional, but good for UX)
        // setMessages(prev => [...prev, { id: 'temp', content, senderId: 'me', createdAt: new Date() }]);

        await sendMessage(id, content);

        // Refresh messages immediately
        const data = await getMessages(id);
        setMessages(data);
        setSending(false);
    };

    const handleOfferResponse = async (messageId: string, status: 'ACCEPTED' | 'REJECTED') => {
        await respondToOffer(messageId, status);
        // Refresh messages to show updated status
        const data = await getMessages(id);
        setMessages(data);
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <Link href="/inbox" className={styles.backButton}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                </Link>
                <div className={styles.headerInfo}>
                    <div className={styles.headerName}>Chat</div>
                    {/* Could add online status here */}
                </div>
                <div style={{ width: 24 }}></div> {/* Spacer for alignment */}
            </div>

            {/* Messages */}
            <div className={styles.messageList}>
                {loading ? (
                    <div className={styles.loading}>Loading chat...</div>
                ) : messages.length === 0 ? (
                    <div className={styles.empty}>
                        <p>No messages yet. Say hello!</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.senderId !== id; // If sender is NOT the other user, it's me
                        // Check for offer type OR if content starts with "Offer:" as a fallback
                        const isOffer = msg.type === 'OFFER' || (msg.content && msg.content.startsWith('Offer:'));

                        return (
                            <div key={msg.id} className={`${styles.messageRow} ${isMe ? styles.me : styles.them}`}>
                                <div className={`${styles.bubble} ${isOffer ? styles.offerBubble : ''}`}>
                                    {isOffer ? (
                                        <div className={styles.offerCard}>
                                            <div className={styles.offerHeader}>
                                                <span className={styles.offerLabel}>Make an Offer</span>
                                            </div>

                                            {/* Item Preview Section */}
                                            {msg.listing ? (
                                                <div className={styles.offerItem}>
                                                    {msg.listing.images && (
                                                        <img
                                                            src={JSON.parse(msg.listing.images)[0]}
                                                            alt={msg.listing.title}
                                                            className={styles.offerImage}
                                                        />
                                                    )}
                                                    <div className={styles.offerItemInfo}>
                                                        <div className={styles.offerItemTitle}>
                                                            {msg.listing.title}
                                                            {msg.listing.status === 'SOLD' && (
                                                                <span style={{
                                                                    marginLeft: '8px',
                                                                    padding: '2px 8px',
                                                                    background: '#fee2e2',
                                                                    color: '#991b1b',
                                                                    borderRadius: '4px',
                                                                    fontSize: '0.75rem',
                                                                    fontWeight: 700
                                                                }}>SOLD</span>
                                                            )}
                                                        </div>
                                                        <div className={styles.offerItemPrice}>{msg.listing.price} MAD</div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className={styles.offerItem}>
                                                    <div className={styles.offerItemInfo}>
                                                        <div className={styles.offerItemTitle}>Item Unavailable</div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Offer Amount Section */}
                                            <div className={styles.offerAmountSection}>
                                                <span className={styles.offerAmountLabel}>Offered Price:</span>
                                                <span className={styles.offerAmountValue}>{msg.offerAmount || msg.content.replace('Offer: ', '').replace(' MAD', '')} MAD</span>
                                            </div>

                                            <div className={styles.offerStatus}>
                                                Status: <strong className={styles[msg.offerStatus?.toLowerCase() || 'pending']}>{msg.offerStatus || 'PENDING'}</strong>
                                            </div>

                                            {/* Show actions only for the receiver (seller) if pending */}
                                            {!isMe && (msg.offerStatus === 'PENDING' || !msg.offerStatus) && (
                                                <div className={styles.offerActions}>
                                                    <button
                                                        onClick={() => handleOfferResponse(msg.id, 'ACCEPTED')}
                                                        className={styles.acceptBtn}
                                                    >
                                                        Accept
                                                    </button>
                                                    <button
                                                        onClick={() => handleOfferResponse(msg.id, 'REJECTED')}
                                                        className={styles.rejectBtn}
                                                    >
                                                        Decline
                                                    </button>
                                                </div>
                                            )}

                                            {/* Show Buy Now button for the buyer if accepted AND item not sold */}
                                            {isMe && msg.offerStatus === 'ACCEPTED' && msg.listingId && msg.listing?.status !== 'SOLD' && (
                                                <div className={styles.offerActions}>
                                                    <Link href={`/checkout/${msg.listingId}`} className={styles.buyNowBtn}>
                                                        Buy Now for {msg.offerAmount} MAD
                                                    </Link>
                                                </div>
                                            )}

                                            {/* Show item sold message if accepted but item is sold */}
                                            {isMe && msg.offerStatus === 'ACCEPTED' && msg.listing?.status === 'SOLD' && (
                                                <div style={{
                                                    padding: '12px',
                                                    background: '#fee2e2',
                                                    color: '#991b1b',
                                                    borderRadius: '8px',
                                                    textAlign: 'center',
                                                    fontSize: '0.875rem',
                                                    fontWeight: 600
                                                }}>
                                                    ⛔ This item has been sold
                                                </div>
                                            )}

                                            {/* View Item Link */}
                                            <div className={styles.viewItemLink}>
                                                <Link href={`/items/${msg.listingId}`}>
                                                    View Item Details
                                                </Link>
                                            </div>
                                        </div>
                                    ) : (
                                        msg.content
                                    )}
                                    <div className={styles.timestamp}>
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className={styles.inputArea}>
                <input
                    type="text"
                    className={styles.input}
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                />
                <button type="submit" disabled={!newMessage.trim() || sending} className={styles.sendButton}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                </button>
            </form>
        </div>
    );
}
