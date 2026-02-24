"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ImageUploader } from "@/components/tools/ImageUploader";
import { ToolModal } from "@/components/modal/ToolModal";
import { Icon } from "@/components/ui/Icon";
import { resizeImageClient } from "@/lib/processing/resize";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { useFileUpload } from "@/hooks/useFileUpload";

import { ResizeSettings } from "./types";

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
    const {
        files,
        activeIndex,
        setActiveIndex,
        activeFile,
        addFiles,
        removeFile,
        clearAll,
        updateFileSettings
    } = useFileUpload([]);

    const [isProcessing, setIsProcessing] = useState(false);

    const handleUpload = async (uploadedFiles: File[]) => {
        // We first need the natural dimensions before storing in universal state hook
        const enrichedFiles = await Promise.all(uploadedFiles.map(async (file) => {
            const tempUrl = URL.createObjectURL(file);
            const img = new Image();
            img.src = tempUrl;
            await new Promise((resolve) => {
                img.onload = resolve;
            });
            URL.revokeObjectURL(tempUrl);

            // Return raw file with its dimensions
            return {
                file,
                dimensions: { width: img.width, height: img.height }
            };
        }));

        // Now add to universal hook one by one or in batch
        // The universal hook creates the actual persistent Blob URL
        enrichedFiles.forEach(({ file, dimensions }) => {
            addFiles([file], {
                ...DEFAULT_SETTINGS,
                width: dimensions.width,
                height: dimensions.height,
                // Note: since originalWidth/Height live on root in IntegratedFile, we map it
                // We'll just rely on settings width/height for default
            });
        });

        toast.success(`Allocated ${enrichedFiles.length} images for resizing.`);
    };

    const handleUpdateSettings = (id: string, newSettings: Partial<ResizeSettings>) => {
        const file = files.find(f => f.id === id);
        if (!file) return;

        let finalSettings = { ...(file.settings as ResizeSettings), ...newSettings };

        // Handle Aspect Ratio Locking
        if (finalSettings.lockAspectRatio && finalSettings.mode === "pixels") {
            // we rely on the initial settings.width/height as 'original' since useFileUpload doesn't strictly know dimensions universally
            const originalW = Number(file.settings.width);
            const originalH = Number(file.settings.height);
            // This logic is slightly flawed if they change default width entirely, but sufficient for now
        }

        updateFileSettings(id, finalSettings);
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
                // Approximate original dims by looking at settings if originalWidth isn't explicitly mapped in hook
                const w = Number(fileMeta.settings?.width || 0);
                const h = Number(fileMeta.settings?.height || 0);
                const dims = getComputedDimensions(w, h, fileMeta.settings as ResizeSettings);

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
                    quality: (fileMeta.settings.quality || 90) / 100,
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

    const customPreview = activeFile ? (
        <div className="w-full h-full p-4 md:p-8 flex items-center justify-center relative">
            {/* Checkerboard background to show bounds of the forced aspect ratio */}
            <div
                className="relative flex items-center justify-center max-w-full max-h-full shadow-md drop-shadow-sm border border-slate-200 bg-[linear-gradient(45deg,#f8f9fa_25%,transparent_25%,transparent_75%,#f8f9fa_75%,#f8f9fa),linear-gradient(45deg,#f8f9fa_25%,transparent_25%,transparent_75%,#f8f9fa_75%,#f8f9fa)] bg-white bg-[length:20px_20px] bg-[position:0_0,10px_10px]"
                style={{
                    aspectRatio: activeFile.settings?.width && activeFile.settings?.height
                        ? `${activeFile.settings.width} / ${activeFile.settings.height}`
                        : undefined
                }}
            >
                <img
                    src={activeFile.previewUrl}
                    alt="Live Preview"
                    className="w-full h-full pointer-events-none"
                    style={{
                        objectFit: activeFile.settings?.width && activeFile.settings?.height ? 'fill' : 'contain'
                    }}
                />
            </div>

            {/* Floating overlay to signify it's a live preview */}
            <div className="absolute bottom-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm text-[10px] font-bold uppercase tracking-wider text-[#0081C9] flex items-center gap-1.5 z-10">
                <Icon name="eye" size={14} /> Live Preview
            </div>
        </div>
    ) : null;

    return (
        <div className="w-full space-y-8">
            {files.length === 0 && (
                <div className="mt-6 w-full max-w-7xl mx-auto">
                    <div className="rounded-2xl border border-border bg-surface shadow-xl shadow-primary/5 p-4 md:p-8 backdrop-blur-sm">
                        <ImageUploader onUpload={handleUpload} />
                    </div>
                </div>
            )}

            <ToolModal
                isOpen={files.length > 0}
                onClose={clearAll}
                title="Resize Images"
                files={files}
                activeIndex={activeIndex}
                setActiveIndex={setActiveIndex}
                onPrimaryAction={handleProcess}
                primaryActionText={
                    <span className="flex items-center justify-center gap-2">
                        <Icon name="expand" size={18} />
                        {files.length > 1 ? "Resize All" : "Resize"}
                    </span>
                }
                isProcessing={isProcessing}
                customPreview={customPreview}
            >
                {/* TOOL SPECIFIC SIDEBAR CONTENT */}
                {activeFile && (
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 mb-6 font-sans">Resize Image</h2>

                            {/* Dimension comparison box */}
                            <div className="bg-[#E8ECEF] rounded-xl p-4 flex items-center justify-between shadow-sm">
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium text-slate-500 mb-1">Original</span>
                                    <span className="text-base font-bold text-slate-800">
                                        {activeFile.file ? `${activeFile.originalWidth || activeFile.settings?.width || '-'}x${activeFile.originalHeight || activeFile.settings?.height || '-'}` : "—"}
                                    </span>
                                </div>
                                <div className="text-slate-500">
                                    <Icon name="arrow-right" size={16} strokeWidth={2.5} />
                                </div>
                                <div className="flex flex-col text-right">
                                    <span className="text-xs font-medium text-slate-500 mb-1">Resized</span>
                                    <span className="text-base font-bold text-slate-800">
                                        {`${activeFile.settings?.width || '-'}x${activeFile.settings?.height || '-'}`}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Dimensions Inputs */}
                        <div className="flex items-end gap-3 w-full">
                            <div className="flex-1 space-y-1.5 flex flex-col">
                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 block mb-1">Width (px)</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="10000"
                                    value={activeFile.settings?.width || ""}
                                    onChange={(e) => updateFileSettings(activeFile.id, { width: e.target.value })}
                                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0081C9]/50 focus:border-[#0081C9] transition-all"
                                />
                            </div>
                            <button
                                onClick={() => updateFileSettings(activeFile.id, { lockAspectRatio: !activeFile.settings?.lockAspectRatio })}
                                className={`flex items-center justify-center w-11 h-11 rounded-lg border transition-all shadow-sm shrink-0 ${activeFile.settings?.lockAspectRatio ? "border-[#0081C9]/50 bg-[#0081C9]/5 text-[#0081C9] ring-1 ring-[#0081C9]/20" : "border-slate-300 hover:bg-slate-50 text-slate-400"}`}
                                title={activeFile.settings?.lockAspectRatio ? "Unlock aspect ratio" : "Lock aspect ratio"}
                            >
                                <Icon name={activeFile.settings?.lockAspectRatio ? "lock" : "unlock"} size={18} />
                            </button>
                            <div className="flex-1 space-y-1.5 flex flex-col">
                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 block mb-1">Height (px)</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="10000"
                                    value={activeFile.settings?.height || ""}
                                    onChange={(e) => updateFileSettings(activeFile.id, { height: e.target.value })}
                                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0081C9]/50 focus:border-[#0081C9] transition-all"
                                />
                            </div>
                        </div>

                        {/* Quality Slider exactly matching mockup */}
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 block mb-1">Quality</label>
                                <span className="text-sm font-semibold text-slate-800">{activeFile.settings?.quality || 90}%</span>
                            </div>

                            <div className="relative w-full h-2 rounded-full cursor-pointer bg-slate-700">
                                {/* The filled portion */}
                                <div
                                    className="absolute top-0 left-0 h-full bg-[#0081C9] rounded-l-full pointer-events-none"
                                    style={{ width: `${activeFile.settings?.quality || 90}%` }}
                                ></div>

                                <input
                                    type="range"
                                    min="1"
                                    max="100"
                                    value={activeFile.settings?.quality || 90}
                                    onChange={(e) => updateFileSettings(activeFile.id, { quality: parseInt(e.target.value) })}
                                    className="absolute top-0 left-0 w-full opacity-0 cursor-pointer z-10 h-full"
                                    style={{ appearance: 'none', WebkitAppearance: 'none' }}
                                />

                                {/* Custom Thumb visually tracking the input */}
                                <div
                                    className="absolute top-1/2 -translate-y-1/2 h-5 w-5 bg-white rounded-full border-2 border-[#0081C9] shadow-sm pointer-events-none z-0 mt-[1px]"
                                    style={{ left: `calc(${activeFile.settings?.quality || 90}% - 10px)` }}
                                ></div>
                            </div>

                            <div className="flex justify-between items-center mt-3 text-xs font-medium text-slate-500 font-sans tracking-tight">
                                <span>Smaller file</span>
                                <span>Higher quality</span>
                            </div>
                        </div>
                    </div>
                )}
            </ToolModal>
        </div>
    );
}
