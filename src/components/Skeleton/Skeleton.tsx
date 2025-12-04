interface SkeletonProps {
    variant?: 'text' | 'circular' | 'rectangular';
    width?: string | number;
    height?: string | number;
    className?: string;
}

export default function Skeleton({
    variant = 'rectangular',
    width = '100%',
    height = '100%',
    className = ''
}: SkeletonProps) {
    const style: React.CSSProperties = {
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
    };

    return (
        <div
            className={`skeleton ${variant} ${className}`}
            style={style}
            aria-busy="true"
            aria-live="polite"
        />
    );
}
