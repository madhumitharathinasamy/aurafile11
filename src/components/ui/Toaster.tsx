"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

export function Toaster({ ...props }: ToasterProps) {
    return (
        <Sonner
            theme="light"
            position="top-center"
            className="toaster group"
            toastOptions={{
                classNames: {
                    toast:
                        "group toast group-[.toaster]:bg-white group-[.toaster]:text-neutral-950 group-[.toaster]:border-neutral-200 group-[.toaster]:shadow-lg",
                    description: "group-[.toast]:text-neutral-500",
                    actionButton:
                        "group-[.toast]:bg-neutral-900 group-[.toast]:text-neutral-50 group-[.toast]:font-medium",
                    cancelButton:
                        "group-[.toast]:bg-neutral-100 group-[.toast]:text-neutral-500 group-[.toast]:font-medium",
                },
            }}
            {...props}
        />
    );
}
