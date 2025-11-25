'use client';

interface VerificationBadgeProps {
    phoneVerified?: boolean;
    emailVerified?: boolean;
    idVerified?: boolean;
    topRatedSeller?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export default function VerificationBadge({
    phoneVerified,
    emailVerified,
    idVerified,
    topRatedSeller,
    size = 'md'
}: VerificationBadgeProps) {
    const sizeClasses = {
        sm: 'text-xs px-1.5 py-0.5',
        md: 'text-sm px-2 py-1',
        lg: 'text-base px-3 py-1.5'
    };

    const badges = [];

    if (topRatedSeller) {
        badges.push(
            <span
                key="top"
                className={`inline-flex items-center gap-1 ${sizeClasses[size]} bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full font-semibold`}
                title="Top Rated Seller"
            >
                🏆 Top Rated
            </span>
        );
    }

    if (idVerified) {
        badges.push(
            <span
                key="id"
                className={`inline-flex items-center gap-1 ${sizeClasses[size]} bg-blue-100 text-blue-800 rounded-full font-semibold border border-blue-300`}
                title="ID Verified"
            >
                ✓ Verified
            </span>
        );
    }

    if (phoneVerified && !idVerified) {
        badges.push(
            <span
                key="phone"
                className={`inline-flex items-center gap-1 ${sizeClasses[size]} bg-green-100 text-green-800 rounded-full font-semibold border border-green-300`}
                title="Phone Verified"
            >
                📞 Phone
            </span>
        );
    }

    if (emailVerified && !idVerified && !phoneVerified) {
        badges.push(
            <span
                key="email"
                className={`inline-flex items-center gap-1 ${sizeClasses[size]} bg-gray-100 text-gray-800 rounded-full font-semibold border border-gray-300`}
                title="Email Verified"
            >
                ✉️ Email
            </span>
        );
    }

    if (badges.length === 0) return null;

    return <div className="flex gap-2 flex-wrap">{badges}</div>;
}
