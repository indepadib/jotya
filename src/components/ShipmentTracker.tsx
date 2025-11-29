'use client';

import { useState, useEffect } from 'react';

interface TrackingEvent {
    status: string;
    location: string;
    timestamp: string;
    description: string;
}

interface TrackingInfo {
    carrier: string;
    trackingNumber: string;
    status: string;
    estimatedDelivery: string;
    events: TrackingEvent[];
}

export default function ShipmentTracker({ trackingNumber, carrier = 'AMANA' }: { trackingNumber: string, carrier?: string }) {
    const [info, setInfo] = useState<TrackingInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTracking = async () => {
            try {
                const res = await fetch(`/api/shipments/track?number=${trackingNumber}&carrier=${carrier}`);
                const data = await res.json();
                if (!res.ok) throw new Error(data.error);
                setInfo(data);
            } catch (err: any) {
                setError(err.message || 'Failed to load tracking');
            } finally {
                setLoading(false);
            }
        };

        if (trackingNumber) {
            fetchTracking();
        }
    }, [trackingNumber, carrier]);

    if (loading) return <div className="animate-pulse h-24 bg-gray-100 rounded-lg"></div>;
    if (error) return <div className="text-red-500 text-sm">⚠️ {error}</div>;
    if (!info) return null;

    return (
        <div className="bg-white p-4 rounded-lg border border-gray-200 mt-4">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="font-semibold text-gray-900">Tracking Information</h3>
                    <p className="text-sm text-gray-500">{info.carrier} • {info.trackingNumber}</p>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-bold ${info.status === 'DELIVERED' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                    {info.status}
                </div>
            </div>

            <div className="space-y-4 relative">
                {/* Vertical Line */}
                <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gray-200" />

                {info.events.map((event, index) => (
                    <div key={index} className="relative pl-6">
                        {/* Dot */}
                        <div className={`absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 border-white ${index === 0 ? 'bg-blue-600' : 'bg-gray-400'
                            }`} />

                        <div className="text-sm font-medium text-gray-900">{event.description}</div>
                        <div className="text-xs text-gray-500">
                            {event.location} • {new Date(event.timestamp).toLocaleString()}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
