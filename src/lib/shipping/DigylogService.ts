import { CarrierAdapter, ShipmentData, CarrierLabel, TrackingEvent } from './types';
import { generateQRCode } from '@/lib/shipping';

const DIGYLOG_API_URL = process.env.DIGYLOG_API_URL || 'https://api.digylog.com/api/v2/seller';

export class DigylogService implements CarrierAdapter {
    private apiKey: string;

    constructor() {
        this.apiKey = process.env.DIGYLOG_API_KEY || '';
    }

    async generateLabel(shipment: ShipmentData): Promise<CarrierLabel> {
        try {
            // Mapping to Digylog payload (Hypothetical based on typical structure)
            const payload = {
                client_ref: shipment.transactionId,
                receiver: {
                    name: shipment.buyer.name,
                    phone: shipment.buyer.phone,
                    address: shipment.buyer.address?.street || '',
                    city: shipment.buyer.address?.city || ''
                },
                parcel: {
                    weight: shipment.package.weight,
                    cod: shipment.codAmount || 0
                }
            };

            // Uncomment when ready to test real API
            /*
            const response = await fetch(`${DIGYLOG_API_URL}/orders`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`Digylog API Error: ${response.statusText}`);
            }
            const data = await response.json();
            const trackingNumber = data.tracking_number || data.id;
            */

            // MOCK FALLBACK (Keep until we confirm exact payload structure)
            const trackingNumber = `DIG-${Math.floor(Math.random() * 1000000)}`;

            const qrCode = await generateQRCode({
                tn: trackingNumber,
                carrier: 'DIGYLOG',
                cod: shipment.codAmount
            });

            return {
                trackingNumber,
                carrier: 'DIGYLOG',
                carrierRef: trackingNumber,
                qrCode
            };

        } catch (error) {
            console.error('Digylog API Error:', error);
            throw new Error('Failed to generate Digylog label');
        }
    }

    async trackShipment(trackingNumber: string): Promise<TrackingEvent[]> {
        // Placeholder for tracking API
        return [];
    }

    async getQuote(fromCity: string, toCity: string, weight: number): Promise<number> {
        // Digylog Pricing Model (Mock)
        // Intra-city: 20 MAD
        // Zone 1 (Major Cities): 35 MAD
        // Zone 2 (Remote): 45 MAD

        const normalize = (city: string) => city.toLowerCase().trim();
        const from = normalize(fromCity);
        const to = normalize(toCity);

        if (from === to) return 20;

        const majorCities = ['casablanca', 'rabat', 'marrakech', 'tanger', 'fes', 'agadir', 'meknes', 'kenitra', 'mohammedia'];

        const isFromMajor = majorCities.some(c => from.includes(c));
        const isToMajor = majorCities.some(c => to.includes(c));

        if (isFromMajor && isToMajor) {
            return 35;
        }

        return 45;
    }
}
