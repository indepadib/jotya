'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import styles from './checkout.module.css';

interface CheckoutFormProps {
    listing: {
        id: string;
        title: string;
        price: number;
        images: string;
        brand: string | null;
        size: string | null;
    };
    effectivePrice?: number;
    isOfferPrice?: boolean;
}

type ShippingMethod = 'AMANA' | 'DIGYLOG' | 'TAWSSIL' | 'HAND_DELIVERY';
type PaymentMethod = 'STRIPE' | 'COD' | 'PAYPAL';

export default function CheckoutForm({ listing, effectivePrice, isOfferPrice }: CheckoutFormProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    // Address fields
    const [street, setStreet] = useState('');
    const [city, setCity] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [phone, setPhone] = useState('');

    // Address autocomplete
    const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loadingAddresses, setLoadingAddresses] = useState(false);

    // Shipping and payment
    const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('DIGYLOG');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('STRIPE');

    let images = [];
    try {
        images = JSON.parse(listing.images);
    } catch (e) {
        images = [];
    }
    const firstImage = images[0] || '';

    // Calculate fees
    const price = effectivePrice || listing.price;
    const PROTECTION_FEE = price * 0.05; // 5% Buyer Protection

    const [shippingCost, setShippingCost] = useState(35);
    const [calculatingShipping, setCalculatingShipping] = useState(false);

    // Dynamic shipping cost
    useEffect(() => {
        const fetchShipping = async () => {
            if (!city) return;
            setCalculatingShipping(true);
            try {
                // Import dynamically to avoid server-side issues in client component if needed
                const { calculateShipping } = await import('@/app/actions/shipping');
                const cost = await calculateShipping('Casablanca', city, 1, shippingMethod); // Default from Casablanca for now
                setShippingCost(cost);
            } catch (error) {
                console.error('Failed to calculate shipping', error);
            } finally {
                setCalculatingShipping(false);
            }
        };

        const timer = setTimeout(() => {
            fetchShipping();
        }, 500);

        return () => clearTimeout(timer);
    }, [city, shippingMethod]);

    const SHIPPING = shippingCost;
    const TOTAL = price + SHIPPING + PROTECTION_FEE;

    const validateAddress = () => {
        if (!street || !city || !phone) {
            setError('Please fill in all required address fields');
            return false;
        }
        return true;
    };

    // Debounced address search
    const searchAddress = useCallback(async (query: string) => {
        if (query.length < 3) {
            setAddressSuggestions([]);
            return;
        }

        setLoadingAddresses(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?` +
                `q=${encodeURIComponent(query)},Morocco&` +
                `format=json&` +
                `addressdetails=1&` +
                `limit=5`
            );
            const data = await response.json();
            setAddressSuggestions(data);
            setShowSuggestions(true);
        } catch (error) {
            console.error('Address search error:', error);
        } finally {
            setLoadingAddresses(false);
        }
    }, []);

    // Debounce the search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (street) {
                searchAddress(street);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [street, searchAddress]);

    const handleAddressSelect = (suggestion: any) => {
        const address = suggestion.address;
        setStreet(suggestion.display_name.split(',')[0]);
        if (address.city) setCity(address.city);
        else if (address.town) setCity(address.town);
        else if (address.village) setCity(address.village);
        if (address.postcode) setPostalCode(address.postcode);
        setShowSuggestions(false);
        setAddressSuggestions([]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!validateAddress()) return;

        setLoading(true);

        try {
            const shippingAddress = { street, city, postalCode, country: 'Morocco', phone };

            if (paymentMethod === 'COD') {
                // Create transaction for COD
                const res = await fetch('/api/transactions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        listingId: listing.id,
                        amount: price,
                        shippingMethod,
                        shippingAddress,
                        paymentMethod: 'COD',
                        shippingCost: SHIPPING
                    })
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Failed to create order');

                router.push('/purchases?success=true');
            } else if (paymentMethod === 'PAYPAL') {
                // Store checkout data in sessionStorage before redirect
                sessionStorage.setItem('paypalCheckoutData', JSON.stringify({
                    listingId: listing.id,
                    shippingMethod,
                    shippingAddress,
                    shippingCost: SHIPPING,
                    amount: price
                }));

                // Create PayPal order
                const res = await fetch('/api/paypal/create-order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        listingId: listing.id,
                        shippingMethod,
                        shippingAddress,
                        shippingCost: SHIPPING
                    })
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Failed to create PayPal order');

                if (!data.approvalUrl) {
                    throw new Error('PayPal approval URL not received');
                }

                // Redirect to PayPal (works on all devices including mobile)
                window.location.href = data.approvalUrl;
            } else {
                // Stripe payment
                const res = await fetch('/api/checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ listingId: listing.id })
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Checkout failed');

                if (data.url) {
                    window.location.href = data.url;
                } else {
                    throw new Error('No checkout URL received');
                }
            }
        } catch (err: any) {
            console.error('Checkout Error:', err);
            setError(err.message || 'Checkout failed');
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Checkout</h1>
            </header>

            <form onSubmit={handleSubmit}>
                {/* Order Summary */}
                <div className={styles.summary}>
                    <h2 className={styles.sectionTitle}>Order Summary</h2>
                    <div className={styles.itemRow}>
                        <img src={firstImage} alt={listing.title} className={styles.itemImage} />
                        <div className={styles.itemDetails}>
                            <h3>{listing.title}</h3>
                            <p>{listing.brand} • {listing.size}</p>
                        </div>
                    </div>
                </div>

                {/* Shipping Method */}
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>🚚 Shipping Method</h2>
                    <div className={styles.radioGroup}>
                        <label className={styles.radioOption}>
                            <input
                                type="radio"
                                value="AMANA"
                                checked={shippingMethod === 'AMANA'}
                                onChange={e => setShippingMethod(e.target.value as ShippingMethod)}
                            />
                            <div>
                                <strong>Amana</strong>
                                <span>{calculatingShipping ? '...' : shippingCost} MAD • 2-4 business days</span>
                            </div>
                        </label>
                        <label className={styles.radioOption}>
                            <input
                                type="radio"
                                value="DIGYLOG"
                                checked={shippingMethod === 'DIGYLOG'}
                                onChange={e => setShippingMethod(e.target.value as ShippingMethod)}
                            />
                            <div>
                                <strong>Digylog</strong>
                                <span>{calculatingShipping ? '...' : shippingCost} MAD • 2-5 business days</span>
                            </div>
                        </label>
                        <label className={styles.radioOption}>
                            <input
                                type="radio"
                                value="TAWSSIL"
                                checked={shippingMethod === 'TAWSSIL'}
                                onChange={e => setShippingMethod(e.target.value as ShippingMethod)}
                            />
                            <div>
                                <strong>Tawssil</strong>
                                <span>{calculatingShipping ? '...' : shippingCost} MAD • 3-6 business days</span>
                            </div>
                        </label>
                    </div>
                    {calculatingShipping && <div style={{ fontSize: '0.8rem', color: '#666', marginTop: 8 }}>Calculating shipping rates...</div>}
                </div>

                {/* Shipping Address */}
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>📍 Delivery Address</h2>
                    <div className={styles.formGrid}>
                        <div style={{ position: 'relative', gridColumn: '1 / -1' }}>
                            <input
                                type="text"
                                placeholder="Street Address * (Start typing...)"
                                className={styles.input}
                                value={street}
                                onChange={e => {
                                    setStreet(e.target.value);
                                    setShowSuggestions(true);
                                }}
                                onFocus={() => street.length >= 3 && setShowSuggestions(true)}
                                required
                            />
                            {loadingAddresses && (
                                <div className={styles.loadingIndicator}>Searching...</div>
                            )}
                            {showSuggestions && addressSuggestions.length > 0 && (
                                <div className={styles.suggestions}>
                                    {addressSuggestions.map((suggestion, idx) => (
                                        <div
                                            key={idx}
                                            className={styles.suggestionItem}
                                            onClick={() => handleAddressSelect(suggestion)}
                                        >
                                            {suggestion.display_name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <input
                            type="text"
                            placeholder="City *"
                            className={styles.input}
                            value={city}
                            onChange={e => setCity(e.target.value)}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Postal Code"
                            className={styles.input}
                            value={postalCode}
                            onChange={e => setPostalCode(e.target.value)}
                        />
                        <input
                            type="tel"
                            placeholder="Phone Number *"
                            className={styles.input}
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            required
                        />
                    </div>
                </div>

                {/* Payment Method */}
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>💳 Payment Method</h2>
                    <div className={styles.radioGroup}>
                        <label className={styles.radioOption}>
                            <input
                                type="radio"
                                value="STRIPE"
                                checked={paymentMethod === 'STRIPE'}
                                onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                            />
                            <div>
                                <strong>Card Payment (Stripe)</strong>
                                <span>Pay securely with credit/debit card</span>
                            </div>
                        </label>
                        <label className={styles.radioOption}>
                            <input
                                type="radio"
                                value="COD"
                                checked={paymentMethod === 'COD'}
                                onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                            />
                            <div>
                                <strong>Cash on Delivery (COD)</strong>
                                <span>Pay when you receive the item</span>
                            </div>
                        </label>
                        <label className={styles.radioOption}>
                            <input
                                type="radio"
                                value="PAYPAL"
                                checked={paymentMethod === 'PAYPAL'}
                                onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                            />
                            <div>
                                <strong>PayPal</strong>
                                <span>Pay securely with PayPal account</span>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Price Breakdown */}
                <div className={styles.summary}>
                    <h2 className={styles.sectionTitle}>Price Breakdown</h2>
                    <div className={styles.priceBreakdown}>
                        <div className={styles.row}>
                            <span>
                                Item Price
                                {isOfferPrice && <span className={styles.offerBadge}>Offer Applied</span>}
                            </span>
                            <span>{price.toFixed(2)} MAD</span>
                        </div>
                        <div className={styles.row}>
                            <span>Shipping ({shippingMethod})</span>
                            <span>{SHIPPING.toFixed(2)} MAD</span>
                        </div>
                        <div className={styles.row}>
                            <span>Buyer Protection (5%)</span>
                            <span>{PROTECTION_FEE.toFixed(2)} MAD</span>
                        </div>
                        <div className={styles.totalRow}>
                            <span>Total</span>
                            <span>{TOTAL.toFixed(2)} MAD</span>
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className={styles.payButton}
                    disabled={loading}
                >
                    {loading ? (
                        paymentMethod === 'COD'
                            ? 'Creating Order...'
                            : paymentMethod === 'PAYPAL'
                                ? 'Opening PayPal...'
                                : 'Redirecting to Stripe...'
                    ) : (
                        paymentMethod === 'COD'
                            ? `Place Order (${TOTAL.toFixed(2)} MAD)`
                            : `Pay ${TOTAL.toFixed(2)} MAD`
                    )}
                </button>

                {error && <div className={styles.error}>{error}</div>}

                {paymentMethod === 'STRIPE' && (
                    <p className={styles.secureText}>
                        🔒 You will be redirected to Stripe for secure payment
                    </p>
                )}
                {paymentMethod === 'PAYPAL' && (
                    <p className={styles.secureText}>
                        🔒 You will be redirected to PayPal for secure payment
                    </p>
                )}
            </form>
        </div>
    );
}
