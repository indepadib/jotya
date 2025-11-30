// import { ShippingLabel } from '@prisma/client';

export interface ShipmentData {
    transactionId: string;
    seller: {
        name: string;
        phone: string;
        address: any;
    };
    buyer: {
        name: string;
        phone: string;
        address: any;
    };
    package: {
        weight: number;
        dimensions?: { length: number; width: number; height: number };
        value: number;
    };
    codAmount?: number;
}

export interface CarrierLabel {
    trackingNumber: string;
    carrierRef?: string;
    qrCode: string;
    barcode?: string;
    labelUrl?: string;
    carrier: string;
}

export interface TrackingEvent {
    status: string;
    timestamp: Date;
    location: string;
    notes?: string;
}

export interface CarrierAdapter {
    /**
     * Generate a shipping label with the carrier
     */
    generateLabel(shipment: ShipmentData): Promise<CarrierLabel>;

    /**
     * Track a shipment by tracking number
     */
    trackShipment(trackingNumber: string): Promise<TrackingEvent[]>;

    /**
     * Request a pickup (if supported)
     */
    requestPickup?(label: any): Promise<boolean>;

    /**
     * Cancel a shipment
     */
    cancelShipment?(trackingNumber: string): Promise<boolean>;
}
