"use client";

import { useState, useEffect, useRef } from "react";
import { ImageUploader } from "@/components/tools/ImageUploader";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import { Icon } from "@/components/ui/Icon";
import { removeBackground, Config } from "@imgly/background-removal";

export default function RemoveBgTool() {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null); // Original
    const [processedUrl, setProcessedUrl] = useState<string | null>(null); // Removed BG
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState<string>("");
    const [showComparison, setShowComparison] = useState(false);
    const [longLoading, setLongLoading] = useState(false);

    // Cleanup URLs on unmount
    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            if (processedUrl) URL.revokeObjectURL(processedUrl);
        };
    }, [previewUrl, processedUrl]);

    // Timeout for long loading message
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isProcessing) {
            setLongLoading(false);
            timer = setTimeout(() => {
                setLongLoading(true);
            }, 20000); // 20 seconds
        }
        return () => clearTimeout(timer);
    }, [isProcessing]);

    const handleUpload = async (files: File[]) => {
        if (files.length === 0) return;
        const selectedFile = files[0];
        setFile(selectedFile);

        // Preview original
        const url = URL.createObjectURL(selectedFile);
        setPreviewUrl(url);
        setProcessedUrl(null);
        setIsProcessing(true);
        // Initial message
        setProgress("Preparing AI engine (first time only)…");

        try {
            // Configure removal
            const config: Config = {
                progress: (key: string, current: number, total: number) => {
                    // Only update percentage for inference (processing image)
                    // For downloading, we keep the static friendly message to not stress user with MBs
                    if (key === "compute:inference") {
                        const percent = Math.round((current / total) * 100);
                        setProgress(`Removing Background... ${percent}%`);
                    }
                    // We ignore 'fetch' progress updates to show the clean message requested
                },
                debug: false
            };

            const blob = await removeBackground(selectedFile, config);
            const resultUrl = URL.createObjectURL(blob);
            setProcessedUrl(resultUrl);
            toast.success("Background removed successfully!");
        } catch (error) {
            console.error("Background removal failed:", error);
            toast.error("Failed to remove background. Please try again.");
            setFile(null); // Reset on failure so user can try again
            setPreviewUrl(null);
        } finally {
            setIsProcessing(false);
            setProgress("");
            setLongLoading(false);
        }
    };

    const handleDownload = () => {
        if (!processedUrl) return;
        const link = document.createElement("a");
        link.href = processedUrl;
        link.download = `removed_bg_${file?.name || "image"}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleReset = () => {
        setFile(null);
        setPreviewUrl(null);
        setProcessedUrl(null);
        setIsProcessing(false);
        setShowComparison(false);
    };

    return (
        <div className="flex flex-col gap-8">
            {!file ? (
                <div className="mx-auto max-w-3xl">
                    <ImageUploader onUpload={handleUpload} />
                    <p className="mt-4 text-center text-sm text-muted">
                        Automatically removes background using AI. No manual selection needed.
                    </p>
                </div>
            ) : (
                <div className="grid gap-8 md:grid-cols-[1fr,300px]">
                    {/* Main Preview Area */}
                    <div className="space-y-6">
                        <div className="relative overflow-hidden rounded-xl border border-border bg-slate-100 bg-[linear-gradient(45deg,#ccc_25%,transparent_25%,transparent_75%,#ccc_75%,#ccc),linear-gradient(45deg,#ccc_25%,transparent_25%,transparent_75%,#ccc_75%,#ccc)] bg-[length:20px_20px] bg-[position:0_0,10px_10px] min-h-[400px] flex items-center justify-center">

                            {/* Remove the white/50 overlay that was here so checkerboard is clear */}

                            {isProcessing ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm z-50 text-center p-6">
                                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                                    <p className="mt-4 font-medium text-foreground text-lg">{progress}</p>

                                    {!progress.includes("Removing") && (
                                        <p className="text-sm text-muted mt-2">This may take 10–20 seconds.</p>
                                    )}

                                    {longLoading && (
                                        <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-600 text-sm max-w-xs">
                                            <p className="font-semibold">AI model is taking longer than expected.</p>
                                            <p>Please check your connection or refresh the page.</p>
                                        </div>
                                    )}
                                </div>
                            ) : null}

                            {/* Image Container */}
                            {previewUrl && processedUrl && (
                                <div className="relative max-w-full max-h-[600px] w-auto h-auto">
                                    {/* Base: Processed Image (Always visible, sets layout) */}
                                    <img
                                        src={processedUrl}
                                        alt="Processed"
                                        className="max-w-full max-h-[600px] object-contain relative z-10"
                                    />

                                    {/* Overlay: Original Image (Fades in on hover/hold) */}
                                    <img
                                        src={previewUrl}
                                        alt="Original"
                                        className={`absolute inset-0 w-full h-full object-contain z-20 transition-opacity duration-200 ${showComparison ? "opacity-100" : "opacity-0"
                                            }`}
                                    />
                                </div>
                            )}

                            {/* Loading State: Blur Original */}
                            {isProcessing && previewUrl && (
                                <div className="relative max-w-full max-h-[600px] w-auto h-auto">
                                    <img
                                        src={previewUrl}
                                        alt="Processing"
                                        className="max-w-full max-h-[600px] object-contain opacity-50 blur-sm"
                                    />
                                </div>
                            )}

                        </div>

                        {!isProcessing && processedUrl && (
                            <div className="flex justify-center gap-4">
                                <Button
                                    variant="outline"
                                    onPointerDown={(e) => {
                                        e.preventDefault();
                                        setShowComparison(true);
                                    }}
                                    onPointerUp={(e) => {
                                        e.preventDefault();
                                        setShowComparison(false);
                                    }}
                                    onPointerLeave={() => setShowComparison(false)}
                                    // Prevent text selection and touch scrolling while holding
                                    style={{ touchAction: "none" }}
                                    className="select-none active:scale-95 transition-transform"
                                >
                                    <Icon name="eye" size={16} className="mr-2" />
                                    Hold to Compare
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Settings / Actions Panel */}
                    <div className="space-y-6">
                        <div className="rounded-xl border border-border bg-surface p-6 sticky top-6">
                            <h3 className="mb-6 font-semibold flex items-center gap-2">
                                <Icon name="wand" size={18} />
                                AI Background Removal
                            </h3>

                            <div className="space-y-6">
                                <div className="space-y-2 text-sm text-text-secondary">
                                    <p>Status: <span className={isProcessing ? "text-yellow-500" : "text-green-500 font-medium"}>
                                        {isProcessing ? "Processing..." : "Complete"}
                                    </span></p>
                                    {!isProcessing && processedUrl && (
                                        <p>Output: Transparent PNG</p>
                                    )}
                                </div>

                                <div className="space-y-3 pt-4 border-t border-border">
                                    <Button
                                        variant="primary"
                                        onClick={handleDownload}
                                        className="w-full"
                                        disabled={isProcessing || !processedUrl}
                                    >
                                        <Icon name="download" size={18} className="mr-2" />
                                        Download PNG
                                    </Button>

                                    <Button
                                        variant="secondary"
                                        onClick={handleReset}
                                        className="w-full"
                                        disabled={isProcessing}
                                    >
                                        Remove Another
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
