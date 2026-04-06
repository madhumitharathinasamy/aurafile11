"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ImageUploader } from "@/components/tools/ImageUploader";
import { ToolModal } from "@/components/modal/ToolModal";
import { Icon } from "@/components/ui/Icon";
import { resizeImageClient } from "@/lib/processing/resize";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useFileProcessor } from "@/hooks/useFileProcessor";


import { ToolSettingsRenderer, SettingGroup, SettingRow, ToggleRow, SelectRow } from "@/components/tools/ToolSettingsRenderer";
import { ResizeSettings } from "./types";
import JSZip from "jszip";
import { saveAs } from "file-saver";

const DEFAULT_SETTINGS: ResizeSettings = {
    mode: "pixels",
    width: "",
    height: "",
    percentage: 100,
    lockAspectRatio: true,
    preset: "",
    format: "original",
    quality: 90,
    resampling: "lanczos3",
    fillBackground: "transparent",
    anchor: "center",
    preserveMetadata: true
};

const SOCIAL_PRESETS = [
    { id: "ig-post", label: "IG Post (1080x1080)", width: 1080, height: 1080 },
    { id: "ig-story", label: "IG Story (1080x1920)", width: 1080, height: 1920 },
    { id: "fb-cover", label: "FB Cover (820x312)", width: 820, height: 312 },
    { id: "tw-header", label: "Twitter Header (1500x500)", width: 1500, height: 500 },
    { id: "yt-thumb", label: "YouTube Thumb (1280x720)", width: 1280, height: 720 },
    { id: "li-banner", label: "LinkedIn Banner (1584x396)", width: 1584, height: 396 }
];

export default function ResizeTool() {
    const {
        files,
        activeIndex,
        setActiveIndex,
        activeFile,
        addFiles,
        removeFile,
        clearAll,
        updateFileSettings,
        updateAllFileSettings,
        isBatchMode
    } = useFileUpload([]);

    const [applyToAll, setApplyToAll] = useState(false);

    const { status, processFiles, clearMemory, createSafeObjectURL } = useFileProcessor<number>({
        processFn: async (targetFiles: File[], onProgress: (progress: number) => void) => {
            return new Promise(async (resolve, reject) => {
                let successCount = 0;
                try {
                    for (let i = 0; i < targetFiles.length; i++) {
                        const fileMeta = files.find(f => f.file === targetFiles[i]);
                        if (!fileMeta) continue;

                        const origW = Number(fileMeta.settings?.originalWidth || fileMeta.settings?.width || 100);
                        const origH = Number(fileMeta.settings?.originalHeight || fileMeta.settings?.height || 100);
                        const dims = getComputedDimensions(origW, origH, fileMeta.settings as ResizeSettings);

                        if (dims.width <= 0 || dims.height <= 0) {
                            throw new Error("Invalid dimensions for resize (cannot be 0)");
                        }
                        
                        // Prevent mobile crashes by clamping excessive dimensions to 8192px safely
                        const safeDims = { width: dims.width, height: dims.height };
                        const maxDim = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ? 4096 : 8192;
                        if (safeDims.width > maxDim || safeDims.height > maxDim) {
                            const ratio = Math.min(maxDim / safeDims.width, maxDim / safeDims.height);
                            safeDims.width = Math.floor(safeDims.width * ratio);
                            safeDims.height = Math.floor(safeDims.height * ratio);
                        }

                        const targetFormat = (fileMeta.settings.format === "original"
                            ? (["image/jpeg", "image/png", "image/webp"].includes(fileMeta.file.type)
                                ? fileMeta.file.type
                                : "image/jpeg")
                            : fileMeta.settings.format) as "image/jpeg" | "image/png" | "image/webp";

                        const blob = await resizeImageClient(fileMeta.file, {
                            width: safeDims.width,
                            height: safeDims.height,
                            maintainAspectRatio: false,
                            format: targetFormat,
                            quality: (fileMeta.settings.quality || 90) / 100,
                            fit: "contain",
                            background: fileMeta.settings.fillBackground,
                            anchor: fileMeta.settings.anchor,
                            resampling: fileMeta.settings.resampling
                        });

                        const url = createSafeObjectURL(blob);
                        updateFileSettings(fileMeta.id, { isResized: true, resizedUrl: url, resizedBlob: blob });

                        successCount++;
                        onProgress(((i + 1) / targetFiles.length) * 100);
                    }
                    toast.success("Images resized successfully! Ready to download.");
                    resolve(successCount);
                } catch (error) {
                    toast.error("Failed to resize images. Please try again.");
                    reject(new Error("Failed to resize images. Please try again."));
                }
            });
        }
    });

    const handleUpload = async (uploadedFiles: File[]) => {

        const enrichedFiles = await Promise.all(uploadedFiles.map(async (file) => {
            const tempUrl = URL.createObjectURL(file);
            const img = new Image();
            img.src = tempUrl;
            await new Promise((resolve) => {
                img.onload = resolve;
            });
            URL.revokeObjectURL(tempUrl);

            return {
                file,
                dimensions: { width: img.width, height: img.height }
            };
        }));

        enrichedFiles.forEach(({ file, dimensions }) => {
            addFiles([file], {
                ...DEFAULT_SETTINGS,
                width: dimensions.width,
                height: dimensions.height,
                originalWidth: dimensions.width,
                originalHeight: dimensions.height,
                isResized: false
            });
        });

        if (files.length + enrichedFiles.length > 1) {
            setApplyToAll(true);
        }

        toast.success(`Loaded ${enrichedFiles.length} images for resizing.`);
    };

    const handleApplyToAllChange = (checked: boolean) => {
        setApplyToAll(checked);
        if (checked && activeFile) {
            updateAllFileSettings({
                ...activeFile.settings,
                isResized: false,
                resizedUrl: null,
                resizedBlob: null
            });
        }
    };

    const handleSettingChange = (key: keyof ResizeSettings, value: any) => {
        if (!activeFile) return;

        let finalUpdates: any = { [key]: value, isResized: false };

        if (key === "preset" && value !== "") {
            const preset = SOCIAL_PRESETS.find(p => p.id === value);
            if (preset) {
                finalUpdates.mode = "social" as any;
                finalUpdates.width = preset.width as any;
                finalUpdates.height = preset.height as any;
                finalUpdates.lockAspectRatio = false as any;
            }
        }

        // Maintain Aspect Ratio logic for Width/Height inputs
        if (activeFile.settings.mode === "pixels" && activeFile.settings.lockAspectRatio) {
            const originalRatio = activeFile.settings?.originalWidth && activeFile.settings?.originalHeight
                ? activeFile.settings.originalWidth / activeFile.settings.originalHeight
                : 1;

            if (key === "width" && value !== "") {
                const newWidth = parseInt(value) || 0;
                finalUpdates.height = Math.round(newWidth / originalRatio);
            } else if (key === "height" && value !== "") {
                const newHeight = parseInt(value) || 0;
                finalUpdates.width = Math.round(newHeight * originalRatio);
            }
        }

        if (applyToAll && isBatchMode) {
            // If applying to all, reset resizing state globally
            updateAllFileSettings(finalUpdates);
        } else {
            updateFileSettings(activeFile.id, finalUpdates);
        }
    };

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
        const filesToProcess = applyToAll ? files : (activeFile ? [activeFile] : []);
        processFiles(filesToProcess.map(f => f.file));
    };

    const handleDownload = async () => {
        try {
            if (applyToAll && isBatchMode) {
                const zip = new JSZip();
                const promises = files.map(async (fileMeta) => {
                    if (!fileMeta.settings.isResized || !fileMeta.settings.resizedBlob) return;
                    const blob = fileMeta.settings.resizedBlob;

                    const targetFormat = (fileMeta.settings.format === "original"
                        ? (fileMeta.file.type.split('/')[1] || "jpg")
                        : (fileMeta.settings.format.split('/')[1] || "jpg"));
                    const ext = targetFormat === "jpeg" ? "jpg" : targetFormat;

                    const originalName = fileMeta.file.name.substring(0, fileMeta.file.name.lastIndexOf('.')) || fileMeta.file.name;
                    zip.file(`${originalName}-resized.${ext}`, blob);
                });

                await Promise.all(promises);
                const content = await zip.generateAsync({ type: "blob" });
                saveAs(content, "aurafile-resized.zip");
                toast.success("Downloaded ZIP file!");
            } else if (activeFile && activeFile.settings.isResized && activeFile.settings.resizedBlob) {
                const blob = activeFile.settings.resizedBlob;

                const targetFormat = (activeFile.settings.format === "original"
                    ? (activeFile.file.type.split('/')[1] || "jpg")
                    : (activeFile.settings.format.split('/')[1] || "jpg"));
                const ext = targetFormat === "jpeg" ? "jpg" : targetFormat;
                const originalName = activeFile.file.name.substring(0, activeFile.file.name.lastIndexOf('.')) || activeFile.file.name;
                saveAs(blob, `${originalName}-resized.${ext}`);
            }
        } catch (error) {
            toast.error("Failed to download images.");
        }
    };

    const isAllReady = applyToAll && files.length > 0 && files.every((f: any) => f.settings.isResized && f.settings.resizedUrl);
    const isCurrentReady = !applyToAll && activeFile && activeFile.settings.isResized && activeFile.settings.resizedUrl;

    const handlePrimaryAction = () => {
        if (isAllReady || isCurrentReady) {
            handleDownload();
        } else {
            handleProcess();
        }
    };

    const getPrimaryActionText = () => {
        if (status === 'processing') return "Processing...";
        if (isAllReady) return `Download All (${files.length} Zipped)`;
        if (isCurrentReady) return "Download Image";
        return applyToAll && files.length > 1 ? `Resize All (${files.length})` : "Resize Image";
    };

    const handleClearAll = () => {
        clearAll();
        clearMemory();
    };

    const customPreview = activeFile ? (
        <div className="w-full h-full p-4 md:p-8 flex items-center justify-center relative">
            <div
                className="relative flex items-center justify-center max-w-full max-h-full shadow-md drop-shadow-sm border border-slate-200 bg-[linear-gradient(45deg,#f8f9fa_25%,transparent_25%,transparent_75%,#f8f9fa_75%,#f8f9fa),linear-gradient(45deg,#f8f9fa_25%,transparent_25%,transparent_75%,#f8f9fa_75%,#f8f9fa)] bg-white bg-[length:20px_20px] bg-[position:0_0,10px_10px]"
                style={{
                    aspectRatio: activeFile.settings?.width && activeFile.settings?.height
                        ? `${activeFile.settings.width} / ${activeFile.settings.height}`
                        : undefined
                }}
            >
                <img
                    src={activeFile.settings?.resizedUrl || activeFile.previewUrl}
                    alt={activeFile.settings?.resizedUrl ? "Resized Image" : "Live Preview"}
                    loading="lazy"
                    className="w-full h-full pointer-events-none"
                    style={{
                        objectFit: activeFile.settings?.width && activeFile.settings?.height ? 'fill' : 'contain'
                    }}
                />
            </div>

            <div className={`absolute bottom-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 z-10 ${activeFile.settings?.resizedUrl ? 'text-green-600' : 'text-[#0081C9]'}`}>
                {activeFile.settings?.resizedUrl ? (
                    <><Icon name="check-circle" size={14} /> Resized Successfully</>
                ) : (
                    <><Icon name="eye" size={14} /> Live Preview</>
                )}
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
                onClose={handleClearAll}
                title="Resize Images"
                files={files}
                activeIndex={activeIndex}
                setActiveIndex={setActiveIndex}
                onPrimaryAction={handlePrimaryAction}
                primaryActionText={
                    <span className="flex items-center justify-center gap-2">
                        <Icon name={(isAllReady || isCurrentReady) ? "download" : "expand"} size={18} />
                        {getPrimaryActionText()}
                    </span>
                }
                isProcessing={status === 'processing'}
                isSuccess={(applyToAll && files.length > 1) ? isAllReady : isCurrentReady}
                onDownload={handleDownload}
                onStartOver={clearAll}
                onWipeMemory={handleClearAll}
                customPreview={customPreview}
            >
                {activeFile && (
                    <ToolSettingsRenderer
                        title="Resize Settings"
                        isBatchMode={isBatchMode}
                        applyToAll={applyToAll}
                        onApplyToAllChange={handleApplyToAllChange}
                    >
                        <div className="bg-[#E8ECEF] rounded-xl p-4 flex items-center justify-between shadow-sm">
                            <div className="flex flex-col">
                                <span className="text-xs font-medium text-muted-foreground mb-1">Original</span>
                                <span className="text-sm font-bold text-slate-800">
                                    {activeFile.file ? `${activeFile.settings?.originalWidth || activeFile.settings?.width || '-'}x${activeFile.settings?.originalHeight || activeFile.settings?.height || '-'}` : "—"}
                                </span>
                            </div>
                            <div className="text-slate-400">
                                <Icon name="arrow-right" size={16} strokeWidth={2.5} />
                            </div>
                            <div className="flex flex-col text-right">
                                <span className="text-xs font-medium text-muted-foreground mb-1">Resized</span>
                                <span className="text-sm font-bold text-slate-800">
                                    {`${activeFile.settings?.width || '-'}x${activeFile.settings?.height || '-'}`}
                                </span>
                            </div>
                        </div>

                        {/* Dimensions Setting Group */}
                        <SettingGroup title="Dimensions">
                            <SelectRow
                                label="Mode"
                                value={activeFile.settings?.mode}
                                onChange={(val) => handleSettingChange("mode", val)}
                                options={[
                                    { label: "Exact Pixels", value: "pixels" },
                                    { label: "Percentage Scale", value: "percentage" },
                                    { label: "Social Presets", value: "social" }
                                ]}
                            />

                            {activeFile.settings?.mode === "percentage" ? (
                                <div className="space-y-4 pt-2">
                                    <SettingRow label="Scale Percentage" value={`${activeFile.settings?.percentage}%`}>
                                        <div className="relative w-full h-2 rounded-full cursor-pointer bg-slate-200 mt-2">
                                            <div
                                                className="absolute top-0 left-0 h-full bg-[#0081C9] rounded-l-full pointer-events-none"
                                                style={{ width: `${Math.min(100, (activeFile.settings?.percentage / 200) * 100)}%` }}
                                            ></div>
                                            <input
                                                type="range"
                                                min="1"
                                                max="200"
                                                value={activeFile.settings?.percentage}
                                                onChange={(e) => handleSettingChange("percentage", parseInt(e.target.value))}
                                                className="absolute top-0 left-0 w-full opacity-0 cursor-pointer z-10 h-full"
                                            />
                                            <div
                                                className="absolute top-1/2 -translate-y-1/2 h-4 w-4 bg-white rounded-full border-[2px] border-[#0081C9] shadow-sm pointer-events-none z-0 mt-[1px]"
                                                style={{ left: `calc(${Math.min(100, (activeFile.settings?.percentage / 200) * 100)}% - 8px)` }}
                                            ></div>
                                        </div>
                                    </SettingRow>
                                </div>
                            ) : activeFile.settings?.mode === "social" ? (
                                <div className="pt-2">
                                    <SelectRow
                                        label="Preset"
                                        value={activeFile.settings?.preset || ""}
                                        onChange={(val) => handleSettingChange("preset", val)}
                                        options={[
                                            { label: "Choose Preset...", value: "" },
                                            ...SOCIAL_PRESETS.map(p => ({ label: p.label, value: p.id }))
                                        ]}
                                    />
                                </div>
                            ) : (
                                <div className="flex items-end gap-3 w-full pt-2">
                                    <div className="flex-1 space-y-1.5 flex flex-col">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">Width (px)</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={activeFile.settings?.width || ""}
                                            onChange={(e) => handleSettingChange("width", e.target.value)}
                                            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-[#0081C9]"
                                        />
                                    </div>
                                    <button
                                        onClick={() => handleSettingChange("lockAspectRatio", !activeFile.settings?.lockAspectRatio)}
                                        className={`flex items-center justify-center w-10 h-10 rounded-lg border transition-all shadow-sm shrink-0 ${activeFile.settings?.lockAspectRatio ? "border-[#0081C9]/50 bg-[#0081C9]/5 text-[#0081C9] ring-1 ring-[#0081C9]/20" : "border-slate-200 hover:bg-slate-50 text-slate-400"}`}
                                        title={activeFile.settings?.lockAspectRatio ? "Unlock aspect ratio" : "Lock aspect ratio"}
                                    >
                                        <Icon name={activeFile.settings?.lockAspectRatio ? "lock" : "unlock"} size={16} />
                                    </button>
                                    <div className="flex-1 space-y-1.5 flex flex-col">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">Height (px)</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={activeFile.settings?.height || ""}
                                            onChange={(e) => handleSettingChange("height", e.target.value)}
                                            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-[#0081C9]"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Canvas Fit Advanced Options */}
                            <div className="h-px bg-slate-200/60 my-2 w-full"></div>

                            <SelectRow
                                label="Resampling Algorithm"
                                value={activeFile.settings?.resampling}
                                onChange={(val) => handleSettingChange("resampling", val)}
                                options={[
                                    { label: "Lanczos 3 (Best Quality)", value: "lanczos3" },
                                    { label: "Bicubic (Smooth)", value: "bicubic" },
                                    { label: "Bilinear (Fast)", value: "bilinear" },
                                    { label: "Nearest Neighbor (Pixel Art)", value: "nearest" }
                                ]}
                            />

                            <SelectRow
                                label="Canvas Anchor"
                                value={activeFile.settings?.anchor}
                                onChange={(val) => handleSettingChange("anchor", val)}
                                options={[
                                    { label: "Center", value: "center" },
                                    { label: "Top Left", value: "northwest" },
                                    { label: "Top Right", value: "northeast" },
                                    { label: "Bottom Left", value: "southwest" },
                                    { label: "Bottom Right", value: "southeast" }
                                ]}
                            />
                        </SettingGroup>

                        {/* Background Setting */}
                        <SettingGroup title="Background Fill">
                            <div className="flex items-center gap-3 w-full">
                                <label className="text-sm font-medium text-slate-700 flex-1">
                                    Fill Color (if stretched)
                                </label>
                                <input
                                    type="color"
                                    value={(!activeFile.settings?.fillBackground || activeFile.settings?.fillBackground === 'transparent') ? "#ffffff" : activeFile.settings.fillBackground}
                                    onChange={(e) => handleSettingChange("fillBackground", e.target.value)}
                                    disabled={!activeFile.settings?.fillBackground || activeFile.settings?.fillBackground === 'transparent'}
                                    className={`h-8 w-12 cursor-pointer border-none bg-transparent rounded-lg ${(!activeFile.settings?.fillBackground || activeFile.settings?.fillBackground === 'transparent') ? 'opacity-30' : ''}`}
                                />
                                <button
                                    onClick={() => handleSettingChange("fillBackground", (!activeFile.settings?.fillBackground || activeFile.settings?.fillBackground === "transparent") ? "#FFFFFF" : "transparent")}
                                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded transition-colors ${(!activeFile.settings?.fillBackground || activeFile.settings?.fillBackground === "transparent") ? "bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZTVlNWU1IiAvPgo8cmVjdCB4PSI0IiB5PSI0IiB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZTVlNWU1IiAvPgogICAgPC9zdmc+')] bg-repeat text-[#0081C9] border border-[#0081C9]/30 ring-2 ring-[#0081C9] ring-offset-1" : "bg-slate-100 text-muted-foreground hover:bg-slate-200"}`}
                                >
                                    <span className={(!activeFile.settings?.fillBackground || activeFile.settings?.fillBackground === "transparent") ? "bg-white/80 px-1 rounded-sm" : ""}>Transparent</span>
                                </button>
                            </div>
                        </SettingGroup>

                        {/* Export Setting Group */}
                        <SettingGroup title="Output Options">
                            <SelectRow
                                label="Export Format"
                                value={activeFile.settings?.format}
                                onChange={(val) => handleSettingChange("format", val)}
                                options={[
                                    { label: "Same as Original", value: "original" },
                                    { label: "Save as JPG", value: "image/jpeg" },
                                    { label: "Save as PNG", value: "image/png" },
                                    { label: "Save as WebP", value: "image/webp" }
                                ]}
                            />

                            <SettingRow label="Quality" value={`${activeFile.settings?.quality}%`}>
                                <div className="relative w-full h-2 rounded-full cursor-pointer bg-slate-200 mt-2">
                                    <div
                                        className="absolute top-0 left-0 h-full bg-[#0081C9] rounded-l-full pointer-events-none"
                                        style={{ width: `${activeFile.settings?.quality}%` }}
                                    ></div>
                                    <input
                                        type="range"
                                        min="1"
                                        max="100"
                                        value={activeFile.settings?.quality}
                                        onChange={(e) => handleSettingChange("quality", parseInt(e.target.value))}
                                        className="absolute top-0 left-0 w-full opacity-0 cursor-pointer z-10 h-full"
                                    />
                                    <div
                                        className="absolute top-1/2 -translate-y-1/2 h-4 w-4 bg-white rounded-full border-[2px] border-[#0081C9] shadow-sm pointer-events-none z-0 mt-[1px]"
                                        style={{ left: `calc(${activeFile.settings?.quality}% - 8px)` }}
                                    ></div>
                                </div>
                            </SettingRow>

                            <ToggleRow
                                label="Preserve Metadata"
                                description="Keep camera info and timestamp"
                                checked={activeFile.settings?.preserveMetadata}
                                onChange={(val) => handleSettingChange("preserveMetadata", val)}
                            />
                        </SettingGroup>
                    </ToolSettingsRenderer>
                )}
            </ToolModal>
        </div>
    );
}
