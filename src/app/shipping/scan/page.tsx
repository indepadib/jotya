'use client';

import React, { useState } from 'react';
import QRScanner from '@/components/Shipping/QRScanner';
import { ShipmentStatus } from '@/lib/shipping';
import styles from './page.module.css';

export default function ScanPage() {
    const [scannedData, setScannedData] = useState<any | null>(null);
    const [status, setStatus] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleScan = (decodedText: string) => {
        try {
            const data = JSON.parse(decodedText);
            // Verify it's a valid label QR (has tracking number 'tn')
            if (data.tn) {
                setScannedData(data);
                setMessage(null);
            } else {
                setMessage({ type: 'error', text: 'Invalid QR Code: Not a shipping label' });
            }
        } catch (e) {
            setMessage({ type: 'error', text: 'Failed to parse QR code data' });
        }
    };

    const updateStatus = async (newStatus: string) => {
        if (!scannedData?.tn) return;

        setLoading(true);
        try {
            const response = await fetch('/api/shipping/update-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    trackingNumber: scannedData.tn,
                    status: newStatus,
                    location: 'Scanner App (Test)',
                    scannedBy: 'Carrier/Admin'
                })
            });

            if (!response.ok) throw new Error('Failed to update status');

            setMessage({ type: 'success', text: `Status updated to ${newStatus}` });
            setScannedData(null); // Reset for next scan
        } catch (error) {
            setMessage({ type: 'error', text: 'Error updating status' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Carrier Scanner</h1>

            {!scannedData ? (
                <div className={styles.scannerWrapper}>
                    <QRScanner onScanSuccess={handleScan} />
                </div>
            ) : (
                <div className={styles.resultCard}>
                    <h2 className={styles.cardTitle}>Package Scanned</h2>
                    <div className={styles.info}>
                        <p><strong>Tracking #:</strong> {scannedData.tn}</p>
                        <p><strong>Sender:</strong> {scannedData.s}</p>
                        <p><strong>Receiver:</strong> {scannedData.b}</p>
                        {scannedData.cod > 0 && (
                            <p className={styles.cod}><strong>COD:</strong> {scannedData.cod} MAD</p>
                        )}
                    </div>

                    <div className={styles.actions}>
                        <p className={styles.actionLabel}>Update Status To:</p>
                        <div className={styles.buttonGrid}>
                            <button
                                onClick={() => updateStatus(ShipmentStatus.PICKED_UP)}
                                disabled={loading}
                                className={`${styles.btn} ${styles.btnPickup}`}
                            >
                                📦 Picked Up
                            </button>
                            <button
                                onClick={() => updateStatus(ShipmentStatus.IN_TRANSIT)}
                                disabled={loading}
                                className={`${styles.btn} ${styles.btnTransit}`}
                            >
                                🚚 In Transit
                            </button>
                            <button
                                onClick={() => updateStatus(ShipmentStatus.OUT_FOR_DELIVERY)}
                                disabled={loading}
                                className={`${styles.btn} ${styles.btnDelivery}`}
                            >
                                🛵 Out for Delivery
                            </button>
                            <button
                                onClick={() => updateStatus(ShipmentStatus.DELIVERED)}
                                disabled={loading}
                                className={`${styles.btn} ${styles.btnDelivered}`}
                            >
                                ✅ Delivered
                            </button>
                        </div>
                        <button
                            onClick={() => setScannedData(null)}
                            className={styles.btnCancel}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {message && (
                <div className={`${styles.message} ${styles[message.type]}`}>
                    {message.text}
                </div>
            )}
        </div>
    );
}
