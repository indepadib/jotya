import { CarrierAdapter, ShipmentData, CarrierLabel, TrackingEvent } from './types';
import { generateTrackingNumber, generateQRCode, ShipmentStatus } from '@/lib/shipping';

export class MockCarrierService implements CarrierAdapter {
    private carrierName: string;

    constructor(name: string = 'JOTYA_INTERNAL') {
        this.carrierName = name;
    }

    async generateLabel(shipment: ShipmentData): Promise<CarrierLabel> {
        const trackingNumber = generateTrackingNumber();

        // Generate internal QR code
        const qrData = {
            tn: trackingNumber,
            s: shipment.seller.name,
            b: shipment.buyer.name,
            cod: shipment.codAmount || 0
        };

        const qrCode = await generateQRCode(qrData);

        return {
            trackingNumber,
            carrier: this.carrierName,
            qrCode,
            barcode: trackingNumber // Simple barcode simulation
        };
    }

    async trackShipment(trackingNumber: string): Promise<TrackingEvent[]> {
        // In a real scenario, this would fetch from an external API
        // For mock, we rely on our internal DB history which is handled by the service layer,
        // so this might just return empty or simulated live data.
        return [];
    }
}
