import { useState, useEffect, useRef } from "react";
import { resizeImageClient, ResizeOptions } from "@/lib/processing/resize";

interface LivePreviewOptions extends ResizeOptions {
    file: File | null;
}

interface LivePreviewResult {
    previewUrl: string | null;
    previewSize: number;
    isGenerating: boolean;
}

export function useLivePreview({
    file,
    width,
    height,
    maintainAspectRatio,
    format,
    quality,
    fit,
    background
}: LivePreviewOptions, debounceMs: number = 300): LivePreviewResult {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewSize, setPreviewSize] = useState<number>(0);
    const [isGenerating, setIsGenerating] = useState<boolean>(false);

    // To keep track of the latest object URL so we can revoke it
    const latestUrlRef = useRef<string | null>(null);

    useEffect(() => {
        if (!file) {
            setPreviewUrl(null);
            setPreviewSize(0);
            setIsGenerating(false);
            return;
        }

        let isMounted = true;
        setIsGenerating(true);

        const generatePreview = async () => {
            try {
                const blob = await resizeImageClient(file, {
                    width,
                    height,
                    maintainAspectRatio,
                    format,
                    quality,
                    fit,
                    background
                });

                if (isMounted) {
                    const newUrl = URL.createObjectURL(blob);

                    if (latestUrlRef.current) {
                        URL.revokeObjectURL(latestUrlRef.current);
                    }

                    latestUrlRef.current = newUrl;
                    setPreviewUrl(newUrl);
                    setPreviewSize(blob.size);
                }
            } catch (error) {
            } finally {
                if (isMounted) {
                    setIsGenerating(false);
                }
            }
        };

        const timer = setTimeout(generatePreview, debounceMs);

        return () => {
            isMounted = false;
            clearTimeout(timer);
        };
    }, [file, width, height, maintainAspectRatio, format, quality, fit, background, debounceMs]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (latestUrlRef.current) {
                URL.revokeObjectURL(latestUrlRef.current);
            }
        };
    }, []);

    return { previewUrl, previewSize, isGenerating };
}
