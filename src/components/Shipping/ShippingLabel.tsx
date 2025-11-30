'use client';

import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import styles from './ShippingLabel.module.css';

interface ShippingLabelProps {
    label: any;
    seller: any;
    buyer: any;
    transaction: any;
}

export default function ShippingLabel({ label, seller, buyer, transaction }: ShippingLabelProps) {
    const componentRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: `Label-${label.trackingNumber}`,
    } as any);

    return (
        <div className={styles.container}>
            <button onClick={handlePrint} className={styles.printButton}>
                🖨️ Print Label
            </button>

            <div className={styles.labelPreview}>
                <div ref={componentRef} className={styles.printableLabel}>
                    {/* Header */}
                    <div className={styles.header}>
                        <div className={styles.logo}>JOTYA</div>
                        <div className={styles.carrier}>{label.carrier}</div>
                    </div>

                    <div className={styles.divider} />

                    {/* Main Content */}
                    <div className={styles.body}>
                        {/* QR Code Section */}
                        <div className={styles.qrSection}>
                            <img src={label.qrCode} alt="Tracking QR" className={styles.qrCode} />
                            <div className={styles.trackingNumber}>{label.trackingNumber}</div>
                        </div>

                        {/* Addresses */}
                        <div className={styles.addresses}>
                            <div className={styles.addressBlock}>
                                <div className={styles.label}>FROM (SENDER):</div>
                                <div className={styles.name}>{seller.name}</div>
                                <div className={styles.text}>{label.pickupAddress?.street || 'No Street'}</div>
                                <div className={styles.text}>
                                    {label.pickupAddress?.city}, {label.pickupAddress?.postalCode}
                                </div>
                                <div className={styles.text}>{seller.phone || '+212...'}</div>
                            </div>

                            <div className={styles.addressBlock}>
                                <div className={styles.label}>TO (RECIPIENT):</div>
                                <div className={styles.name}>{buyer.name}</div>
                                <div className={styles.text}>{label.deliveryAddress?.street || transaction.shippingAddress?.street}</div>
                                <div className={styles.text}>
                                    {label.deliveryAddress?.city || transaction.shippingAddress?.city}, {label.deliveryAddress?.postalCode || transaction.shippingAddress?.postalCode}
                                </div>
                                <div className={styles.text}>{buyer.phone || transaction.shippingAddress?.phone}</div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.divider} />

                    {/* Details */}
                    <div className={styles.footer}>
                        <div className={styles.detail}>
                            <span>Date:</span> {new Date(label.createdAt).toLocaleDateString()}
                        </div>
                        <div className={styles.detail}>
                            <span>Weight:</span> {label.weight || '0.5'} kg
                        </div>
                        {transaction.paymentMethod === 'COD' && (
                            <div className={styles.codBox}>
                                COD AMOUNT: {transaction.amount} MAD
                            </div>
                        )}
                    </div>

                    {/* Barcode Simulation */}
                    <div className={styles.barcode}>
                        <div className={styles.bars}></div>
                        <div className={styles.barcodeText}>{label.trackingNumber}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
