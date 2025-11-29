import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PayPal SDK
const paypal = require('@paypal/checkout-server-sdk');

function paypalClient() {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    const environment = process.env.NODE_ENV === 'production'
        ? new paypal.core.LiveEnvironment(clientId, clientSecret)
        : new paypal.core.SandboxEnvironment(clientId, clientSecret);

    return new paypal.core.PayPalHttpClient(environment);
}

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { listingId, shippingMethod, shippingAddress, shippingCost } = await request.json();

        // Fetch listing
        const listing = await prisma.listing.findUnique({
            where: { id: listingId },
            include: { seller: true }
        });

        if (!listing) {
            return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
        }

        if (listing.status !== 'AVAILABLE') {
            return NextResponse.json({ error: 'Listing not available' }, { status: 400 });
        }

        // Calculate total
        const itemPrice = listing.price;
        const buyerProtection = itemPrice * 0.05; // 5% buyer protection
        const total = itemPrice + (shippingCost || 0) + buyerProtection;

        // Create PayPal order
        const requestOrder = new paypal.orders.OrdersCreateRequest();
        requestOrder.prefer("return=representation");
        requestOrder.requestBody({
            intent: 'CAPTURE',
            purchase_units: [{
                amount: {
                    currency_code: 'USD', // PayPal requires USD/EUR/etc, not MAD
                    value: total.toFixed(2),
                    breakdown: {
                        item_total: {
                            currency_code: 'USD',
                            value: itemPrice.toFixed(2)
                        },
                        shipping: {
                            currency_code: 'USD',
                            value: (shippingCost || 0).toFixed(2)
                        },
                        handling: {
                            currency_code: 'USD',
                            value: buyerProtection.toFixed(2)
                        }
                    }
                },
                description: listing.title,
                custom_id: listingId,
                items: [{
                    name: listing.title,
                    unit_amount: {
                        currency_code: 'USD',
                        value: itemPrice.toFixed(2)
                    },
                    quantity: '1'
                }]
            }],
            application_context: {
                brand_name: 'Jotya',
                shipping_preference: 'NO_SHIPPING', // We handle shipping separately
                user_action: 'PAY_NOW',
                return_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`,
                cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/items/${listingId}`
            }
        });

        const client = paypalClient();
        const order = await client.execute(requestOrder);

        return NextResponse.json({
            orderID: order.result.id
        });

    } catch (error: any) {
        console.error('PayPal order creation error:', error);
        return NextResponse.json({
            error: error?.message || 'Failed to create PayPal order'
        }, { status: 500 });
    }
}
