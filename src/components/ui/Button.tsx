import Link from "next/link";

import { clsx } from "clsx"; // Using clsx for cleaner class composability (need to install or implement simple helper)

// Minimal class joiner since I can't install clsx without asking user (security rule? wait, I can install dependencies)
// But I'll stick to template literals for zero-dependency if simplest.
// Actually, I will create a utility for it if needed, but template literals are fine for now.

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline";
    href?: string;
}

export function Button({ variant = "primary", className, href, children, ...props }: ButtonProps) {
    const baseStyles = "inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

    const variants = {
        primary: "bg-primary text-primary-foreground border border-transparent",
        secondary: "bg-secondary text-secondary-foreground border border-border/50",
        outline: "bg-transparent border border-border text-foreground hover:bg-surface"
    };

    const rootClassName = `${baseStyles} ${variants[variant]} ${className || ""}`;

    if (href) {
        return (
            <Link href={href} className={rootClassName}>
                {children}
            </Link>
        );
    }

    return (
        <button className={rootClassName} {...props}>
            {children}
        </button>
    );
}
