'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import styles from './QRScanner.module.css';

interface QRScannerProps {
    onScanSuccess: (decodedText: string, decodedResult: any) => void;
    onScanFailure?: (error: any) => void;
}

export default function QRScanner({ onScanSuccess, onScanFailure }: QRScannerProps) {
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);
    const [scanError, setScanError] = useState<string | null>(null);

    useEffect(() => {
        // Initialize scanner
        const scanner = new Html5QrcodeScanner(
            "reader",
            {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0
            },
            /* verbose= */ false
        );

        scanner.render(
            (decodedText, decodedResult) => {
                // Handle success
                console.log("Scan success:", decodedText);
                onScanSuccess(decodedText, decodedResult);
                // Optional: Clear scanner after success if you want single scan
                // scanner.clear(); 
            },
            (errorMessage) => {
                // Handle scan failure (happens frequently while scanning)
                // console.warn("Scan error:", errorMessage);
                if (onScanFailure) onScanFailure(errorMessage);
            }
        );

        scannerRef.current = scanner;

        // Cleanup
        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(error => {
                    console.error("Failed to clear scanner", error);
                });
            }
        };
    }, [onScanSuccess, onScanFailure]);

    return (
        <div className={styles.container}>
            <div id="reader" className={styles.reader}></div>
            {scanError && <p className={styles.error}>{scanError}</p>}
            <p className={styles.instruction}>Point camera at the shipping label QR code</p>
        </div>
    );
}
