'use server';

import { CarrierFactory } from '@/lib/shipping/CarrierFactory';

export async function calculateShipping(
    fromCity: string,
    toCity: string,
    weight: number,
    carrierType: string
) {
    try {
        const carrier = CarrierFactory.getCarrier(carrierType);
        if (!carrier.getQuote) {
            // Fallback if carrier doesn't support quotes
            return 35;
        }

        const cost = await carrier.getQuote(fromCity, toCity, weight);
        return cost;
    } catch (error) {
        console.error('Error calculating shipping:', error);
        return 35; // Default fallback
    }
}
