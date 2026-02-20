"use client";

import { Icon } from "@/components/ui/Icon";

interface ResizeBottomNavProps {
    onResize: () => void;
    onReset: () => void;
    isProcessing: boolean;
    hasFiles: boolean;
}

export function ResizeBottomNav({
    onResize,
    onReset,
    isProcessing,
    hasFiles
}: ResizeBottomNavProps) {
    if (!hasFiles) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up-fade border-t border-border bg-background/80 p-4 backdrop-blur-lg md:static md:animate-none md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
            <div className="mx-auto flex max-w-7xl gap-3">
                <button
                    onClick={onReset}
                    disabled={isProcessing}
                    className="flex h-12 w-full flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-surface font-medium text-foreground transition-all hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Start Over
                </button>
                <button
                    onClick={onResize}
                    disabled={isProcessing}
                    className="flex h-12 w-full flex-[2] items-center justify-center gap-2 rounded-xl bg-primary font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isProcessing ? (
                        <>
                            <Icon name="loader-2" className="animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            <Icon name="download" />
                            Resize Images
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
