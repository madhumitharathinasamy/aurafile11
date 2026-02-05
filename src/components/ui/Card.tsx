import Link from "next/link";

interface CardProps {
    title: string;
    description: string;
    href?: string;
    icon?: React.ReactNode;
    className?: string; // Allow overrides
}

export function Card({ title, description, icon, href }: CardProps) {
    const Content = (
        <div className="flex flex-col h-full">
            <h3 className="mb-2 flex items-center gap-3 text-lg font-bold text-foreground">
                {icon && <span className="text-primary">{icon}</span>}
                {title}
            </h3>
            <p className="text-muted leading-relaxed">{description}</p>
        </div>
    );

    const cardClasses = "block p-6 bg-surface rounded-xl border border-border/50 transition-all hover:border-primary/50 hover:shadow-sm w-full max-w-full";

    if (href) {
        return (
            <Link href={href} className={cardClasses}>
                {Content}
            </Link>
        );
    }

    return <div className={cardClasses}>{Content}</div>;
}
