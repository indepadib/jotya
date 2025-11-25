import { icons, IconName } from './icons';

interface IconProps {
    name: IconName;
    className?: string;
    size?: number;
    strokeWidth?: number;
}

export default function Icon({
    name,
    className = '',
    size = 24,
    strokeWidth = 2
}: IconProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            dangerouslySetInnerHTML={{ __html: icons[name] }}
        />
    );
}
