import { requireAdmin } from '@/lib/adminAuth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import styles from '../admin.module.css';

export default async function TransactionsPage() {
    await requireAdmin();

    const transactions = await prisma.transaction.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            buyer: { select: { name: true, email: true } },
            seller: { select: { name: true, email: true } },
            listing: { select: { title: true } }
        }
    });

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Transaction Monitoring</h1>
                <Link href="/admin" className={styles.backBtn}>← Back to Dashboard</Link>
            </div>

            {/* Transactions Table */}
            <div className={styles.table}>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Listing</th>
                            <th>Buyer</th>
                            <th>Seller</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map(tx => (
                            <tr key={tx.id}>
                                <td>
                                    <small style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                                        {tx.id.substring(0, 8)}...
                                    </small>
                                </td>
                                <td>
                                    <Link href={`/items/${tx.listingId}`} className={styles.link} target="_blank">
                                        {tx.listing.title}
                                    </Link>
                                </td>
                                <td>
                                    {tx.buyer.name}
                                    <br />
                                    <small style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                        {tx.buyer.email}
                                    </small>
                                </td>
                                <td>
                                    {tx.seller.name}
                                    <br />
                                    <small style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                        {tx.seller.email}
                                    </small>
                                </td>
                                <td style={{ fontWeight: 600 }}>
                                    {tx.amount.toFixed(0)} MAD
                                    <br />
                                    <small style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                        Net: {tx.netAmount.toFixed(0)} MAD
                                    </small>
                                </td>
                                <td>
                                    <span className={`${styles.statusBadge} ${tx.status === 'DELIVERED' ? styles.approved :
                                            tx.status === 'SHIPPED' ? styles.pending :
                                                tx.status === 'PAID' ? styles.flagged :
                                                    styles.available
                                        }`}>
                                        {tx.status}
                                    </span>
                                </td>
                                <td>
                                    <small style={{ fontSize: '0.85rem' }}>
                                        {new Date(tx.createdAt).toLocaleDateString('en-GB', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                    </small>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div style={{ marginTop: '16px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Total {transactions.length} transactions
            </div>
        </div>
    );
}
