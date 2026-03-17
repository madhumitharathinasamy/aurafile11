"use client";

import { useState, useEffect } from "react";
import { Icon } from "@/components/ui/Icon";

interface ResizeControlsProps {
    width: number;
    height: number;
    aspectRatio: number;
    onWidthChange: (w: number) => void;
    onHeightChange: (h: number) => void;
}

export function ResizeControls({
    width,
    height,
    aspectRatio,
    onWidthChange,
    onHeightChange,
}: ResizeControlsProps) {
    const [locked, setLocked] = useState(true);

    const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (val === "") {
            onWidthChange(0);
            return;
        }
        const newWidth = parseInt(val, 10);
        if (isNaN(newWidth)) return;

        onWidthChange(newWidth);
        if (locked) {
            onHeightChange(Math.round(newWidth / aspectRatio));
        }
    };

    const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (val === "") {
            onHeightChange(0);
            return;
        }
        const newHeight = parseInt(val, 10);
        if (isNaN(newHeight)) return;

        onHeightChange(newHeight);
        if (locked) {
            onWidthChange(Math.round(newHeight * aspectRatio));
        }
    };

    return (
        <div className="flex flex-col items-stretch gap-4 rounded-xl border border-border bg-surface p-6 sm:flex-row sm:items-end">
            <div className="flex flex-1 flex-col gap-2">
                <label className="text-sm font-medium text-text-secondary">Width (px)</label>
                <input
                    type="number"
                    className="w-full rounded-md border border-border bg-white p-3 text-base text-foreground transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                    value={width || ""}
                    onChange={handleWidthChange}
                />
            </div>

            <button
                className={`flex h-[44px] w-full items-center justify-center rounded-md border text-muted transition-all sm:w-[44px] sm:mb-0.5 ${locked
                    ? "border-primary bg-primary text-white hover:bg-[#1D4ED8]"
                    : "border-border bg-white hover:bg-surface hover:text-foreground"
                    }`}
                onClick={() => setLocked(!locked)}
                title={locked ? "Unlock Aspect Ratio" : "Lock Aspect Ratio"}
                aria-label={locked ? "Unlock Aspect Ratio" : "Lock Aspect Ratio"}
            >
                <Icon name={locked ? "lock" : "unlock"} size={20} />
            </button>

            <div className="flex flex-1 flex-col gap-2">
                <label className="text-sm font-medium text-text-secondary">Height (px)</label>
                <input
                    type="number"
                    className="w-full rounded-md border border-border bg-white p-3 text-base text-foreground transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                    value={height || ""}
                    onChange={handleHeightChange}
                />
            </div>
        </div>
    );
}
