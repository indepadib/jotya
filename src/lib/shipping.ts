import QRCode from 'qrcode';

export enum ShipmentStatus {
    PENDING_PICKUP = "PENDING_PICKUP",
    PICKED_UP = "PICKED_UP",
    IN_TRANSIT = "IN_TRANSIT",
    OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY",
    DELIVERED = "DELIVERED",
    FAILED_DELIVERY = "FAILED_DELIVERY",
    RETURNED = "RETURNED"
}

export const SHIPMENT_STATUS_LABELS: Record<string, string> = {
    [ShipmentStatus.PENDING_PICKUP]: "Awaiting Pickup",
    [ShipmentStatus.PICKED_UP]: "Picked Up",
    [ShipmentStatus.IN_TRANSIT]: "In Transit",
    [ShipmentStatus.OUT_FOR_DELIVERY]: "Out for Delivery",
    [ShipmentStatus.DELIVERED]: "Delivered",
    [ShipmentStatus.FAILED_DELIVERY]: "Delivery Failed",
    [ShipmentStatus.RETURNED]: "Returned to Sender"
};

/**
 * Generate a unique tracking number
 * Format: JTY-YYYY-NNNNNN (e.g., JTY-2024-123456)
 */
export function generateTrackingNumber(): string {
    const prefix = 'JTY';
    const year = new Date().getFullYear();
    // Generate 6 random digits
    const random = Math.floor(100000 + Math.random() * 900000);
    return `${prefix}-${year}-${random}`;
}

/**
 * Generate QR code data URL
 */
export async function generateQRCode(data: object): Promise<string> {
    try {
        const jsonString = JSON.stringify(data);
        return await QRCode.toDataURL(jsonString);
    } catch (err) {
        console.error('Error generating QR code:', err);
        throw new Error('Failed to generate QR code');
    }
}

/**
 * Format address for label
 */
export function formatAddress(address: any): string {
    if (!address) return '';
    const parts = [
        address.street,
        address.city,
        address.postalCode,
        address.country
    ].filter(Boolean);
    return parts.join(', ');
}
