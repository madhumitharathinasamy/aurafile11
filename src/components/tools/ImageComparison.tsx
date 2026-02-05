"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Icon } from "@/components/ui/Icon";

interface ImageComparisonProps {
    beforeImage: string;
    afterImage: string;
    beforeLabel?: string;
    afterLabel?: string;
    className?: string;
}

export function ImageComparison({
    beforeImage,
    afterImage,
    beforeLabel = "Original",
    afterLabel = "Compressed",
    className = "",
}: ImageComparisonProps) {
    const [sliderPosition, setSliderPosition] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMove = useCallback(
        (event: MouseEvent | TouchEvent) => {
            if (!containerRef.current) return;

            const rect = containerRef.current.getBoundingClientRect();
            let clientX;

            if (event instanceof MouseEvent) {
                clientX = event.clientX;
            } else {
                clientX = event.touches[0].clientX;
            }

            const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
            const percentage = (x / rect.width) * 100;

            setSliderPosition(percentage);
        },
        []
    );

    const handleMouseDown = () => setIsDragging(true);
    const handleMouseUp = useCallback(() => setIsDragging(false), []);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener("mousemove", handleMove);
            window.addEventListener("touchmove", handleMove);
            window.addEventListener("mouseup", handleMouseUp);
            window.addEventListener("touchend", handleMouseUp);
        }

        return () => {
            window.removeEventListener("mousemove", handleMove);
            window.removeEventListener("touchmove", handleMove);
            window.removeEventListener("mouseup", handleMouseUp);
            window.removeEventListener("touchend", handleMouseUp);
        };
    }, [isDragging, handleMove, handleMouseUp]);

    return (
        <div
            ref={containerRef}
            className={`relative w-full overflow-hidden rounded-xl border border-border bg-surface select-none ${className}`}
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
        >
            {/* After Image (Background) */}
            <img
                src={afterImage}
                alt={afterLabel}
                className="block w-full h-auto object-contain max-h-[500px]"
                draggable={false}
            />
            {/* After Label */}
            <div className="absolute top-4 right-4 bg-black/60 text-white px-2 py-1 rounded text-xs font-medium z-10 pointer-events-none">
                {afterLabel}
            </div>

            {/* Before Image (Clipped) */}
            <div
                className="absolute inset-0 h-full overflow-hidden"
                style={{ width: `${sliderPosition}%` }}
            >
                <img
                    src={beforeImage}
                    alt={beforeLabel}
                    className="block w-full h-full object-contain max-h-[500px]"
                    draggable={false}
                    style={{
                        // We need to counter-act the width clipping to keep image aspect ratio correct 
                        // relative to the parent container.
                        // However, simply setting object-contain on both usually aligns them if they have same aspect ratio.
                        // But since we are clipping the container, the img inside needs to be the full width of the parent.
                        // We can solve this by setting width to the parent's width relative to this clipped container.
                        width: containerRef.current ? containerRef.current.offsetWidth : "100%",
                        maxWidth: "none"
                    }}
                />
                {/* Before Label */}
                <div className="absolute top-4 left-4 bg-black/60 text-white px-2 py-1 rounded text-xs font-medium z-10 pointer-events-none">
                    {beforeLabel}
                </div>
            </div>

            {/* Slider Handle */}
            <div
                className="absolute inset-y-0 w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] cursor-ew-resize z-20 flex items-center justify-center transform -translate-x-1/2"
                style={{ left: `${sliderPosition}%` }}
            >
                <div className="h-8 w-8 rounded-full bg-white shadow-lg flex items-center justify-center text-primary">
                    <Icon name="compare" size={16} />
                </div>
            </div>
        </div>
    );
}
