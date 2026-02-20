"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { ImageUploader } from "@/components/tools/ImageUploader";
import { ImagePreviewList } from "@/components/tools/ImagePreviewList";
import { ResizeBottomNav } from "@/components/tools/ResizeBottomNav";
import { Icon } from "@/components/ui/Icon";
import { resizeImageClient } from "@/lib/processing/resize";
import JSZip from "jszip";
import { saveAs } from "file-saver";

import { ResizeSettings, FileWithMeta } from "./types";

const DEFAULT_SETTINGS: ResizeSettings = {
    mode: "pixels",
    width: "",
    height: "",
    percentage: 100,
    lockAspectRatio: true,
    preset: "",
    format: "original",
    quality: 90
};

export default function ResizeTool() {
    const [files, setFiles] = useState<FileWithMeta[]>([]);
    const [activeFileId, setActiveFileId] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const activeFile = files.find(f => f.id === activeFileId) || null;

    const handleUpload = async (uploadedFiles: File[]) => {
        const newFiles: FileWithMeta[] = [];

        for (const file of uploadedFiles) {
            // Create object URL for preview
            const previewUrl = URL.createObjectURL(file);

            // Get dimensions
            const img = new Image();
            img.src = previewUrl;
            await new Promise((resolve) => {
                img.onload = resolve;
            });

            newFiles.push({
                id: crypto.randomUUID(),
                file,
                previewUrl,
                originalWidth: img.width,
                originalHeight: img.height,
                settings: { ...DEFAULT_SETTINGS, width: img.width, height: img.height }
            });
        }

        setFiles(prev => [...prev, ...newFiles]);
        if (newFiles.length > 0 && !activeFileId) {
            setActiveFileId(newFiles[0].id);
        }
        toast.success(`Allocated ${newFiles.length} images for resizing.`);
    };

    const handleRemoveFile = (id: string) => {
        setFiles(prev => {
            const newFiles = prev.filter(f => f.id !== id);
            // Cleanup blob url
            const fileToRemove = prev.find(f => f.id === id);
            if (fileToRemove) URL.revokeObjectURL(fileToRemove.previewUrl);
            return newFiles;
        });
        if (activeFileId === id) setActiveFileId(null);
    };

    const handleClear = () => {
        files.forEach(f => URL.revokeObjectURL(f.previewUrl));
        setFiles([]);
        setActiveFileId(null);
    };

    const updateSettings = (id: string, newSettings: Partial<ResizeSettings>) => {
        setFiles(prev => prev.map(f => {
            if (f.id !== id) return f;

            // Logic to handle aspect ratio locking and preset changes
            let finalSettings = { ...f.settings, ...newSettings };

            // Handle presets
            if (newSettings.preset) {
                const presetDims = {
                    "ig-post": { width: 1080, height: 1080 },
                    "ig-story": { width: 1080, height: 1920 },
                    "fb-cover": { width: 820, height: 312 },
                    "tw-header": { width: 1500, height: 500 },
                    "yt-thumb": { width: 1280, height: 720 },
                    "li-banner": { width: 1584, height: 396 },
                }[newSettings.preset];

                if (presetDims) {
                    finalSettings = {
                        ...finalSettings,
                        mode: "social",
                        width: presetDims.width,
                        height: presetDims.height,
                        lockAspectRatio: false // Presets override aspect ratio
                    };
                }
            } else if (newSettings.mode === "social" && !newSettings.preset) {
                // switched to social but no preset selected? keep current
            }

            // Handle Aspect Ratio Locking
            if (finalSettings.lockAspectRatio && finalSettings.mode === "pixels") {
                const ratio = f.originalWidth / f.originalHeight;

                // If width changed
                if (newSettings.width && !newSettings.height) {
                    finalSettings.height = Math.round(Number(newSettings.width) / ratio);
                }
                // If height changed
                else if (newSettings.height && !newSettings.width) {
                    finalSettings.width = Math.round(Number(newSettings.height) * ratio);
                }
            }

            return { ...f, settings: finalSettings };
        }));
    };

    // Calculate dimensions based on settings
    const getComputedDimensions = (w: number, h: number, settings: ResizeSettings) => {
        if (settings.mode === "percentage") {
            const scale = settings.percentage / 100;
            return {
                width: Math.round(w * scale),
                height: Math.round(h * scale)
            };
        }

        // Return explicit width/height or original if empty
        return {
            width: Number(settings.width) || w,
            height: Number(settings.height) || h
        };
    };

    const handleProcess = async () => {
        if (files.length === 0) return;
        setIsProcessing(true);

        try {
            const processedFiles = [];

            for (const fileMeta of files) {
                const dims = getComputedDimensions(fileMeta.originalWidth, fileMeta.originalHeight, fileMeta.settings);

                const targetFormat = (fileMeta.settings.format === "original"
                    ? (["image/jpeg", "image/png", "image/webp"].includes(fileMeta.file.type)
                        ? fileMeta.file.type
                        : "image/jpeg")
                    : fileMeta.settings.format) as "image/jpeg" | "image/png" | "image/webp";

                const blob = await resizeImageClient(fileMeta.file, {
                    width: dims.width,
                    height: dims.height,
                    maintainAspectRatio: false,
                    format: targetFormat,
                    quality: fileMeta.settings.quality / 100,
                    fit: "fill"
                });

                processedFiles.push({
                    name: `resized-${fileMeta.file.name}`,
                    blob
                });
            }

            if (processedFiles.length === 1) {
                saveAs(processedFiles[0].blob, processedFiles[0].name);
            } else {
                const zip = new JSZip();
                processedFiles.forEach(f => zip.file(f.name, f.blob));
                const content = await zip.generateAsync({ type: "blob" });
                saveAs(content, "aurafile-resized.zip");
            }

            toast.success("Images resized successfully!");

        } catch (error) {
            console.error(error);
            toast.error("Failed to resize images. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="w-full space-y-8">
            {files.length === 0 ? (
                <div className="mt-6 w-full max-w-7xl mx-auto">
                    <div className="rounded-2xl border border-border bg-surface shadow-xl shadow-primary/5 p-4 md:p-8 backdrop-blur-sm">
                        <ImageUploader onUpload={handleUpload} multiple={true} />
                    </div>
                </div>
            ) : (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4">
                    <div className="rounded-2xl border border-border bg-surface shadow-xl shadow-primary/5 p-4 md:p-8 backdrop-blur-sm w-full max-w-7xl max-h-[90vh] overflow-y-auto flex flex-col items-center justify-start space-y-8">
                        {/* Header with Clear Button */}
                        <div className="flex justify-between items-center w-full bg-card p-4 rounded-xl border border-border shadow-sm">
                            <h2 className="text-xl font-semibold">Resize Images</h2>
                            <button
                                onClick={handleClear}
                                className="px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors border border-transparent hover:border-destructive/20"
                            >
                                Cancel & Clear
                            </button>
                        </div>

                        <div className="w-full">
                            <ImagePreviewList
                                files={files}
                                onClear={handleClear}
                                onRemove={handleRemoveFile}
                                activeFileId={activeFileId}
                                onSelect={(id) => setActiveFileId(id)}
                                onGetDimensions={(w, h, s) => getComputedDimensions(w, h, s)}
                            />
                        </div>

                        {activeFile && (
                            <div className="w-full bg-card rounded-xl border border-border p-6 shadow-sm space-y-6">
                                <h3 className="text-lg font-semibold border-b border-border pb-3">Resize Settings</h3>

                                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 p-2.5 rounded-lg border border-border/50 w-max">
                                    <Icon name="maximize" size={16} className="text-primary/70" />
                                    <span>Original: {activeFile.originalWidth} × {activeFile.originalHeight}px</span>
                                </div>

                                <div className="flex items-end gap-3 max-w-xl">
                                    <div className="flex-1 space-y-1.5">
                                        <label className="font-medium text-muted-foreground text-xs" htmlFor="width">Width (px)</label>
                                        <input
                                            type="number"
                                            id="width"
                                            min="1"
                                            max="10000"
                                            value={activeFile.settings.width}
                                            onChange={(e) => updateSettings(activeFile.id, { width: e.target.value ? Number(e.target.value) : "" })}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all shadow-sm"
                                        />
                                    </div>
                                    <button
                                        onClick={() => updateSettings(activeFile.id, { lockAspectRatio: !activeFile.settings.lockAspectRatio })}
                                        className={`flex items-center justify-center w-10 h-10 rounded-lg border transition-all mb-0.5 shadow-sm ${activeFile.settings.lockAspectRatio ? "border-primary/50 bg-primary/5 text-primary ring-1 ring-primary/20" : "border-border hover:bg-muted/50 text-muted-foreground"}`}
                                        title={activeFile.settings.lockAspectRatio ? "Unlock aspect ratio" : "Lock aspect ratio"}
                                    >
                                        <Icon name={activeFile.settings.lockAspectRatio ? "lock" : "unlock"} size={16} />
                                    </button>
                                    <div className="flex-1 space-y-1.5">
                                        <label className="font-medium text-muted-foreground text-xs" htmlFor="height">Height (px)</label>
                                        <input
                                            type="number"
                                            id="height"
                                            min="1"
                                            max="10000"
                                            value={activeFile.settings.height}
                                            onChange={(e) => updateSettings(activeFile.id, { height: e.target.value ? Number(e.target.value) : "" })}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all shadow-sm"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="font-medium text-muted-foreground text-xs">Quick presets</label>
                                    <div className="flex flex-wrap gap-2">
                                        <button onClick={() => updateSettings(activeFile.id, { preset: "ig-post" })} className="px-3 py-1.5 text-xs font-medium rounded-md border border-border hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all shadow-sm">Instagram Post</button>
                                        <button onClick={() => updateSettings(activeFile.id, { preset: "ig-story" })} className="px-3 py-1.5 text-xs font-medium rounded-md border border-border hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all shadow-sm">Instagram Story</button>
                                        <button onClick={() => updateSettings(activeFile.id, { preset: "fb-cover" })} className="px-3 py-1.5 text-xs font-medium rounded-md border border-border hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all shadow-sm">Facebook Cover</button>
                                        <button onClick={() => updateSettings(activeFile.id, { preset: "tw-header" })} className="px-3 py-1.5 text-xs font-medium rounded-md border border-border hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all shadow-sm">Twitter Header</button>
                                        <button onClick={() => updateSettings(activeFile.id, { preset: "yt-thumb" })} className="px-3 py-1.5 text-xs font-medium rounded-md border border-border hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all shadow-sm">YouTube Thumbnail</button>
                                        <button onClick={() => updateSettings(activeFile.id, { preset: "li-banner" })} className="px-3 py-1.5 text-xs font-medium rounded-md border border-border hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all shadow-sm">LinkedIn Banner</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <ResizeBottomNav
                            onResize={handleProcess}
                            onReset={handleClear}
                            isProcessing={isProcessing}
                            hasFiles={files.length > 0}
                        />
                    </div>
                </div>
            )
            }
        </div>
    );
}
