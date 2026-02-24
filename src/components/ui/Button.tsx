import Link from "next/link";

import { cn } from "@/lib/utils";

// Minimal class joiner since I can't install clsx without asking user (security rule? wait, I can install dependencies)
// But I'll stick to template literals for zero-dependency if simplest.
// Actually, I will create a utility for it if needed, but template literals are fine for now.

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost";
    href?: string;
}

export function Button({ variant = "primary", className, href, children, ...props }: ButtonProps) {
    // Use global 'btn' class for shared physics (lift, scale, transition)
    const baseStyles = "btn text-sm font-semibold ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

    const variants = {
        primary: "btn-primary",
        secondary: "btn-secondary",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground"
    };

    const rootClassName = cn(baseStyles, variants[variant], className);

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
