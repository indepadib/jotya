import { CarrierAdapter, ShipmentData, CarrierLabel, TrackingEvent } from './types';

export class AmanaService implements CarrierAdapter {
    async generateLabel(shipment: ShipmentData): Promise<CarrierLabel> {
        // Mock implementation - replace with actual Amana API when credentials available
        const trackingNumber = `AMANA-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

        return {
            trackingNumber,
            qrCode: '', // Will be generated when real API is integrated
            labelUrl: '', // Amana will provide label URL via API
            carrier: 'AMANA'
        };
    }

    async trackShipment(trackingNumber: string): Promise<TrackingEvent[]> {
        // Mock tracking - replace with actual Amana API
        return [
            {
                status: 'IN_TRANSIT',
                timestamp: new Date(),
                location: 'Centre de tri',
                notes: 'En cours de livraison'
            }
        ];
    }

    async getQuote(fromCity: string, toCity: string, weight: number): Promise<number> {
        // Amana Pricing Model (Mock - based on typical Moroccan courier rates)
        // Standard delivery: 2-4 business days

        const normalize = (city: string) => city.toLowerCase().trim();
        const from = normalize(fromCity);
        const to = normalize(toCity);

        // Intra-city delivery
        if (from === to) return 25;

        // Major cities pricing
        const majorCities = ['casablanca', 'rabat', 'marrakech', 'tanger', 'fes', 'agadir', 'meknes', 'oujda', 'kenitra', 'tetouan'];

        const isFromMajor = majorCities.some(c => from.includes(c));
        const isToMajor = majorCities.some(c => to.includes(c));

        // Major city to major city
        if (isFromMajor && isToMajor) {
            return 35;
        }

        // Remote areas or smaller cities
        return 50;
    }
}
