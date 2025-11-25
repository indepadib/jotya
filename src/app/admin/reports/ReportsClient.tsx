'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from '../admin.module.css';

export default function ReportsClient({ reports }: { reports: any[] }) {
    const [filterStatus, setFilterStatus] = useState('ALL');

    const filteredReports = reports.filter(report =>
        filterStatus === 'ALL' || report.status === filterStatus
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return styles.pending;
            case 'REVIEWED': return styles.flagged;
            case 'RESOLVED': return styles.approved;
            case 'DISMISSED': return styles.rejected;
            default: return '';
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Reports</h1>
                <Link href="/admin" className={styles.backBtn}>← Back to Dashboard</Link>
            </div>

            {/* Filter */}
            <div style={{ marginBottom: '24px' }}>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    style={{
                        padding: '12px 16px',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '1rem',
                        background: 'var(--surface)'
                    }}
                >
                    <option value="ALL">All Reports</option>
                    <option value="PENDING">Pending</option>
                    <option value="REVIEWED">Reviewed</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="DISMISSED">Dismissed</option>
                </select>
            </div>

            {/* Reports Table */}
            <div className={styles.table}>
                <table>
                    <thead>
                        <tr>
                            <th>Reporter</th>
                            <th>Reported User</th>
                            <th>Reason</th>
                            <th>Listing</th>
                            <th>Status</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredReports.map(report => (
                            <tr key={report.id}>
                                <td>
                                    {report.reporter.name}
                                    <br />
                                    <small style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                        {report.reporter.email}
                                    </small>
                                </td>
                                <td>
                                    <strong>{report.reported.name}</strong>
                                    <br />
                                    <small style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                        {report.reported.email}
                                    </small>
                                </td>
                                <td>
                                    <strong>{report.reason}</strong>
                                    {report.description && (
                                        <div>
                                            <small style={{ color: 'var(--text-secondary)' }}>
                                                {report.description}
                                            </small>
                                        </div>
                                    )}
                                </td>
                                <td>
                                    {report.listing ? (
                                        <Link href={`/items/${report.listingId}`} className={styles.link} target="_blank">
                                            {report.listing.title}
                                        </Link>
                                    ) : (
                                        <span style={{ color: 'var(--text-secondary)' }}>-</span>
                                    )}
                                </td>
                                <td>
                                    <span className={`${styles.statusBadge} ${getStatusColor(report.status)}`}>
                                        {report.status}
                                    </span>
                                </td>
                                <td>
                                    <small style={{ fontSize: '0.85rem' }}>
                                        {new Date(report.createdAt).toLocaleDateString('en-GB', {
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

            {filteredReports.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                    No reports found
                </div>
            )}

            <div style={{ marginTop: '16px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Showing {filteredReports.length} of {reports.length} reports
            </div>
        </div>
    );
}
