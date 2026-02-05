import {
    Maximize2,
    Minimize2,
    RefreshCw,
    Shield,
    Globe,
    Zap,
    Lock,
    LockOpen,
    Check,
    Image as ImageIcon,
    Upload,
    Settings,
    Download,
    ArrowLeftRight,
    LucideProps
} from "lucide-react";

export type IconName =
    | "resize"
    | "compress"
    | "convert"
    | "shield"
    | "globe"
    | "zap"
    | "lock"
    | "unlock"
    | "check"
    | "image"
    | "upload"
    | "settings"
    | "download"
    | "rotate-cw"
    | "compare";

const icons: Record<IconName, React.FC<LucideProps>> = {
    resize: Maximize2,
    compress: Minimize2,
    convert: RefreshCw,
    shield: Shield,
    globe: Globe,
    zap: Zap,
    lock: Lock,
    unlock: LockOpen,
    check: Check,
    image: ImageIcon,
    upload: Upload,
    settings: Settings,
    download: Download,
    "rotate-cw": RefreshCw,
    compare: ArrowLeftRight,
};

interface IconProps extends LucideProps {
    name: string;
}

export function Icon({ name, ...props }: IconProps) {
    const LucideIcon = icons[name as IconName] || ImageIcon;
    return <LucideIcon {...props} />;
}
