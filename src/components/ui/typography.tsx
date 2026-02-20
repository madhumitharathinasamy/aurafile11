import React, { ElementType } from 'react';
import { cn } from '@/lib/utils';

interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
    as?: ElementType;
    children: React.ReactNode;
    className?: string;
}

export function PageTitle({ as: Tag = 'h1', children, className, ...props }: TypographyProps) {
    return (
        <Tag className={cn("text-2xl md:text-4xl font-bold text-foreground", className)} {...props}>
            {children}
        </Tag>
    );
}

export function SectionTitle({ as: Tag = 'h2', children, className, ...props }: TypographyProps) {
    return (
        <Tag className={cn("text-xl md:text-3xl font-semibold text-foreground mb-4", className)} {...props}>
            {children}
        </Tag>
    );
}

export function SectionDescription({ as: Tag = 'p', children, className, ...props }: TypographyProps) {
    return (
        <Tag className={cn("text-base md:text-lg text-muted-foreground mb-6", className)} {...props}>
            {children}
        </Tag>
    );
}

export function BodyText({ as: Tag = 'p', children, className, ...props }: TypographyProps) {
    return (
        <Tag className={cn("text-sm md:text-base text-foreground leading-relaxed", className)} {...props}>
            {children}
        </Tag>
    );
}

export function SmallText({ as: Tag = 'p', children, className, ...props }: TypographyProps) {
    return (
        <Tag className={cn("text-xs md:text-sm text-muted-foreground", className)} {...props}>
            {children}
        </Tag>
    );
}
