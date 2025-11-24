import { getConversations } from '@/app/actions/chat';
import styles from './inbox.module.css';
import Link from 'next/link';
import TopNav from '@/components/Layout/TopNav';

export const dynamic = 'force-dynamic';

export default async function InboxPage() {
    const conversations = await getConversations();

    return (
        <div className={styles.container}>
            <TopNav title="Messages" showBack={false} />

            <div className={styles.content}>
                {conversations.length === 0 ? (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                        </div>
                        <h2 className={styles.emptyTitle}>No messages yet</h2>
                        <p className={styles.emptyText}>Start a conversation with a seller to ask about an item.</p>
                        <Link href="/search" className={styles.browseButton}>
                            Browse Items
                        </Link>
                    </div>
                ) : (
                    <div className={styles.list}>
                        {conversations.map((conv: any) => (
                            <Link key={conv.user.id} href={`/inbox/${conv.user.id}`} className={styles.conversation}>
                                <div className={styles.avatarWrapper}>
                                    {conv.user.image ? (
                                        <img src={conv.user.image} alt={conv.user.name} className={styles.avatarImage} />
                                    ) : (
                                        <div className={styles.avatarPlaceholder}>
                                            {conv.user.name ? conv.user.name[0].toUpperCase() : 'U'}
                                        </div>
                                    )}
                                    {/* Online indicator could go here */}
                                </div>
                                <div className={styles.details}>
                                    <div className={styles.headerRow}>
                                        <span className={styles.name}>{conv.user.name || 'User'}</span>
                                        <span className={styles.time}>
                                            {new Date(conv.lastMessage.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                    <div className={styles.previewRow}>
                                        <p className={styles.preview}>
                                            {conv.lastMessage.senderId === conv.user.id ? '' : 'You: '}
                                            {conv.lastMessage.content}
                                        </p>
                                        {/* Unread indicator logic would go here */}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
