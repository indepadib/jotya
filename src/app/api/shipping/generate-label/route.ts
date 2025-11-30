import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { ShipmentStatus } from '@/lib/shipping';
import { CarrierFactory } from '@/lib/shipping/CarrierFactory';

export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { transactionId } = await req.json();
        if (!transactionId) {
            return NextResponse.json({ error: 'Transaction ID is required' }, { status: 400 });
        }

        // Fetch transaction details
        const transaction = await prisma.transaction.findUnique({
            where: { id: transactionId },
            include: {
                listing: true,
                buyer: true,
                seller: true
            }
        });

        if (!transaction) {
            return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
        }

        // Verify user is the seller
        if (transaction.sellerId !== session) {
            return NextResponse.json({ error: 'Only the seller can generate a shipping label' }, { status: 403 });
        }

        // Check if label already exists
        const existingLabel = await prisma.shippingLabel.findUnique({
            where: { transactionId }
        });

        if (existingLabel) {
            return NextResponse.json(existingLabel);
        }

        // Generate new label using Carrier Factory
        const carrierType = transaction.shippingMethod || 'AMANA'; // Default to Amana if not specified
        const carrierService = CarrierFactory.getCarrier(carrierType);

        const shipmentData = {
            transactionId: transaction.id,
            seller: {
                name: transaction.seller.name || 'Seller',
                phone: (transaction.seller.address as any)?.phone || '',
                address: transaction.seller.address
            },
            buyer: {
                name: transaction.buyer.name || 'Buyer',
                phone: (transaction.shippingAddress as any)?.phone || '',
                address: transaction.shippingAddress
            },
            package: {
                weight: 0.5, // Default or fetch from listing
                value: transaction.amount
            },
            codAmount: transaction.paymentMethod === 'COD' ? transaction.amount : 0
        };

        const carrierLabel = await carrierService.generateLabel(shipmentData);

        // Create Shipping Label in DB
        const label = await prisma.shippingLabel.create({
            data: {
                trackingNumber: carrierLabel.trackingNumber,
                transactionId,
                carrier: carrierLabel.carrier,
                carrierRef: carrierLabel.carrierRef,
                pickupAddress: (transaction.seller.address as any) || {},
                deliveryAddress: (transaction.shippingAddress as any) || {},
                declaredValue: transaction.amount,
                qrCode: carrierLabel.qrCode,
                barcode: carrierLabel.barcode,
                labelUrl: carrierLabel.labelUrl,
                status: ShipmentStatus.PENDING_PICKUP,
                statusHistory: [
                    {
                        status: ShipmentStatus.PENDING_PICKUP,
                        timestamp: new Date().toISOString(),
                        notes: 'Label generated via ' + carrierLabel.carrier
                    }
                ]
            }
        });

        // Update Transaction with tracking info
        await prisma.transaction.update({
            where: { id: transactionId },
            data: {
                trackingNumber: carrierLabel.trackingNumber,
                shipmentStatus: 'PENDING_SHIPMENT'
            }
        });

        return NextResponse.json(label);

    } catch (error) {
        console.error('Error generating shipping label:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
