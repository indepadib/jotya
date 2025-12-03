import { CarrierAdapter, ShipmentData, CarrierLabel, TrackingEvent } from './types';
import { generateQRCode } from '@/lib/shipping';

export class TawssilService implements CarrierAdapter {
    async generateLabel(shipment: ShipmentData): Promise<CarrierLabel> {
        // Placeholder for Tawssil API
        const trackingNumber = `TAW-${Math.floor(Math.random() * 1000000)}`;

        const qrCode = await generateQRCode({
            tn: trackingNumber,
            carrier: 'TAWSSIL',
            cod: shipment.codAmount
        });

        return {
            trackingNumber,
            carrier: 'TAWSSIL',
            carrierRef: trackingNumber,
            qrCode
        };
    }

    async trackShipment(trackingNumber: string): Promise<TrackingEvent[]> {
        return [];
    }

    async getQuote(fromCity: string, toCity: string, weight: number): Promise<number> {
        // Tawssil Pricing Model (Mock)
        // Flat rate for most cities: 40 MAD
        // Heavy items (> 3kg): +10 MAD

        if (weight > 3) return 50;
        return 40;
    }
}
