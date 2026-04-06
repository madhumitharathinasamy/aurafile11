"use client";

import { useState, useEffect, useRef } from "react";
import { ImageUploader } from "@/components/tools/ImageUploader";
import { ToolModal } from "@/components/modal/ToolModal";
import { toast } from "sonner";
import { Icon } from "@/components/ui/Icon";

import { useFileUpload } from "@/hooks/useFileUpload";
import { useFileProcessor } from "@/hooks/useFileProcessor";
import { ToolSettingsRenderer, SettingGroup, ToggleRow, SelectRow, SettingRow } from "@/components/tools/ToolSettingsRenderer";
import { ImageComparison } from "@/components/tools/ImageComparison";
import { removeBackground } from "@imgly/background-removal";
import JSZip from "jszip";
import { saveAs } from "file-saver";

interface RemoveBgSettings {
    model: "small" | "medium" | "large";
    bgType: "transparent" | "color" | "blur";
    bgColor: string;
    blurAmount: number;
    format: "image/png" | "image/jpeg";
    edgeFeathering: boolean;
}

const DEFAULT_SETTINGS: RemoveBgSettings = {
    model: "medium",
    bgType: "transparent",
    bgColor: "#FFFFFF",
    blurAmount: 10,
    format: "image/png",
    edgeFeathering: true
};

export default function RemoveBgTool() {
    const {
        files,
        activeIndex,
        setActiveIndex,
        activeFile,
        addFiles,
        clearAll,
        updateFileSettings,
        updateAllFileSettings
    } = useFileUpload([]);

    const [progressText, setProgressText] = useState<string>("");
    const [longLoading, setLongLoading] = useState(false);
    const [applyToAll, setApplyToAll] = useState(false);

    const { status, processFiles, clearMemory, createSafeObjectURL } = useFileProcessor<number>({
        processFn: async (targetFiles: File[], onProgress: (progress: number) => void) => {
            return new Promise(async (resolve, reject) => {
                let successCount = 0;
                setProgressText("Loading AI model…");

                try {
                    for (let i = 0; i < targetFiles.length; i++) {
                        const f = targetFiles[i];
                        const meta = files.find(mf => mf.file === f);
                        if (!meta || meta.settings.isDone) continue;

                        const baseProgress = (i / targetFiles.length) * 100;
                        const progressMultiplier = 1 / targetFiles.length;

                        // Track downloaded bytes to show model download progress
                        const downloadedBytes: { [key: string]: number } = {};
                        const totalBytes: { [key: string]: number } = {};

                        const config = {
                            model: meta.settings.model as any,
                            progress: (key: string, current: number, total: number) => {
                                if (key.startsWith("fetch:")) {
                                    downloadedBytes[key] = current;
                                    totalBytes[key] = total;
                                    const totalDl = Object.values(downloadedBytes).reduce((a, b) => a + b, 0);
                                    const totalAll = Object.values(totalBytes).reduce((a, b) => a + b, 0);
                                    if (totalAll > 0) {
                                        const pct = Math.round((totalDl / totalAll) * 100);
                                        const mb = (totalDl / 1024 / 1024).toFixed(1);
                                        const totalMb = (totalAll / 1024 / 1024).toFixed(1);
                                        if (targetFiles.length === 1) {
                                            setProgressText(`Downloading AI model… ${mb} / ${totalMb} MB (${pct}%)`);
                                        } else {
                                            setProgressText(`Processing ${i + 1}/${targetFiles.length} (Downloading AI...)`);
                                        }
                                        onProgress(baseProgress + (pct * 0.5 * progressMultiplier));
                                    } else {
                                        if (targetFiles.length === 1) {
                                            setProgressText("Downloading AI model… (cached)");
                                        } else {
                                            setProgressText(`Processing ${i + 1}/${targetFiles.length} (AI cached)`);
                                        }
                                        onProgress(baseProgress + (50 * progressMultiplier));
                                    }
                                } else if (key === "compute:inference") {
                                    const percent = Math.round((current / total) * 100);
                                    if (targetFiles.length === 1) {
                                        setProgressText(`Removing background… ${percent}%`);
                                    } else {
                                        setProgressText(`Processing ${i + 1}/${targetFiles.length} (${percent}%)`);
                                    }
                                    onProgress(baseProgress + ((50 + (percent * 0.5)) * progressMultiplier));
                                }
                            },
                            debug: false
                        };

                        const blob = await removeBackground(meta.file, config);

                        updateFileSettings(meta.id, {
                            cutoutBlob: blob,
                            isDone: true
                        });

                        setProgressText(targetFiles.length === 1 ? "Applying final touches…" : `Applying final touches (${i + 1}/${targetFiles.length})…`);
                        await applyPostProcessing(meta.file, blob, meta.settings, meta.id);
                        successCount++;
                        onProgress(((i + 1) / targetFiles.length) * 100);
                    }

                    if (targetFiles.length > 1) {
                        toast.success(`Successfully processed ${successCount} images!`);
                    } else if (successCount > 0) {
                        toast.success("Background removed successfully!");
                    }
                    resolve(successCount);
                } catch (error: any) {
                    toast.error("Failed to remove background. Please try again.");
                    reject(error || new Error("Unknown background removal error"));
                } finally {
                    setProgressText("");
                    setLongLoading(false);
                }
            });
        }
    });

    // Timeout for long loading message
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (status === 'processing') {
            setLongLoading(false);
            timer = setTimeout(() => {
                setLongLoading(true);
            }, 20000);
        }
        return () => clearTimeout(timer);
    }, [status]);

    // Re-render final image whenever settings change, IF we have a cutout
    useEffect(() => {
        if (!activeFile) return;
        const cutout = activeFile.settings?.cutoutBlob;
        if (cutout && activeFile.settings.isDone && status !== 'processing') {
            applyPostProcessing(activeFile.file, cutout, activeFile.settings, activeFile.id);
        }
    }, [activeFile?.settings?.bgType, activeFile?.settings?.bgColor, activeFile?.settings?.blurAmount, activeFile?.settings?.format, activeFile?.settings?.edgeFeathering]);

    const handleUpload = (uploadedFiles: File[]) => {
        if (files.length + uploadedFiles.length > 30) {
            toast.error("You can process up to 30 images at a time.");
            return;
        }
        addFiles(uploadedFiles, {
            ...DEFAULT_SETTINGS,
            isDone: false
        });
        if (files.length + uploadedFiles.length > 1) {
            setApplyToAll(true);
        }
    };

    const handleSettingChange = (key: keyof RemoveBgSettings, value: any) => {
        if (!activeFile) return;

        const updates = { [key]: value };
        if (key === 'bgType' && value === 'transparent') {
            updates.format = 'image/png';
        } else if (key === 'bgType' && value === 'color' && activeFile.settings.format === 'image/png') {
            updates.format = 'image/jpeg';
        }

        if (applyToAll && files.length > 1) {
            updateAllFileSettings(updates);
        } else {
            updateFileSettings(activeFile.id, updates);
        }
    };

    const applyPostProcessing = async (originalFile: File, cutoutBlob: Blob, settings: any, fileId: string) => {
        return new Promise<void>(async (resolve, reject) => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            if (!ctx) return reject(new Error("No canvas context"));
    
            const origImg = new Image();
            const cutoutImg = new Image();
    
            const loadImg = (img: HTMLImageElement, src: string) => new Promise((res, rej) => {
                img.onload = res;
                img.onerror = () => rej(new Error("Failed to load image"));
                img.src = src;
            });
    
            const origUrl = URL.createObjectURL(originalFile);
            const cutoutUrl = URL.createObjectURL(cutoutBlob);
    
            try {
                await Promise.all([
                    loadImg(origImg, origUrl),
                    loadImg(cutoutImg, cutoutUrl)
                ]);
            } catch (err) {
                URL.revokeObjectURL(origUrl);
                URL.revokeObjectURL(cutoutUrl);
                return reject(err);
            }
    
            URL.revokeObjectURL(origUrl);
            URL.revokeObjectURL(cutoutUrl);
    
            let targetW = origImg.width;
            let targetH = origImg.height;
            const maxDim = (typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) ? 2048 : 4096;
            
            if (targetW > maxDim || targetH > maxDim) {
                const ratio = Math.min(maxDim / targetW, maxDim / targetH);
                targetW = Math.round(targetW * ratio);
                targetH = Math.round(targetH * ratio);
            }
    
            canvas.width = targetW;
            canvas.height = targetH;
    
            if (settings.bgType === "color") {
                ctx.fillStyle = settings.bgColor;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            } else if (settings.bgType === "blur") {
                ctx.filter = `blur(${settings.blurAmount}px)`;
                ctx.drawImage(origImg, 0, 0, canvas.width, canvas.height);
                ctx.filter = "none";
            }
    
            ctx.drawImage(cutoutImg, 0, 0, canvas.width, canvas.height);
    
            canvas.toBlob((finalBlob) => {
                if (finalBlob) {
                    const url = createSafeObjectURL(finalBlob);
                    updateFileSettings(fileId, { finalUrl: url, finalBlob: finalBlob });
                    resolve();
                } else {
                    reject(new Error("Failed to encode final image"));
                }
            }, settings.format, 0.95);
        });
    };

    const handleProcess = async () => {
        const filesToProcess = applyToAll ? files.filter(f => !f.settings.isDone) : (activeFile && !activeFile.settings.isDone ? [activeFile] : []);
        if (filesToProcess.length > 0) {
            processFiles(filesToProcess.map(f => f.file));
        }
    };

    const handleDownload = async () => {
        try {
            if (applyToAll && files.length > 1) {
                const zip = new JSZip();
                const doneFiles = files.filter(f => f.settings.isDone && f.settings.finalBlob);
                if (doneFiles.length === 0) {
                    toast.error("No completed images found. Please process them first.");
                    return;
                }
                
                for (const f of doneFiles) {
                    const blob = f.settings.finalBlob;
                    const baseName = f.file.name.substring(0, f.file.name.lastIndexOf('.')) || f.file.name;
                    const ext = f.settings.format === "image/png" ? "png" : "jpg";
                    zip.file(`nobg_${baseName}.${ext}`, blob);
                }
                const content = await zip.generateAsync({ type: "blob" });
                saveAs(content, "aurafile-backgrounds.zip");
                toast.success(`Downloaded ${doneFiles.length} images!`);
            } else {
                const urlToDownload = activeFile?.settings?.finalUrl;
                const blobToDownload = activeFile?.settings?.finalBlob;
                if (!urlToDownload || !activeFile) {
                    toast.error("Image is not ready for download.");
                    return;
                }

                const baseName = activeFile.file.name.substring(0, activeFile.file.name.lastIndexOf('.')) || activeFile.file.name;
                const ext = activeFile.settings.format === "image/png" ? "png" : "jpg";
                
                if (blobToDownload) {
                    saveAs(blobToDownload, `nobg_${baseName}.${ext}`);
                } else {
                    saveAs(urlToDownload, `nobg_${baseName}.${ext}`);
                }
                toast.success("Image downloaded successfully!");
            }
        } catch (err) {
            console.error("Download Error:", err);
            toast.error("Failed to download image. Try again.");
        }
    };

    const isAllReady = applyToAll && files.length > 0 && files.every(f => f.settings.isDone && f.settings.finalUrl);
    const isCurrentReady = !applyToAll && activeFile && activeFile.settings.isDone && activeFile.settings.finalUrl;

    const handleClearAll = () => {
        clearAll();
        clearMemory();
    };

    const customPreview = activeFile ? (
        <div className="w-full h-full p-4 md:p-8 flex items-center justify-center relative bg-[linear-gradient(45deg,#f8f9fa_25%,transparent_25%,transparent_75%,#f8f9fa_75%,#f8f9fa),linear-gradient(45deg,#f8f9fa_25%,transparent_25%,transparent_75%,#f8f9fa_75%,#f8f9fa)] bg-[length:20px_20px] bg-[position:0_0,10px_10px] bg-white">
            {status === 'processing' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 backdrop-blur-md z-50 text-center p-6 gap-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#0081C9] border-t-transparent" />
                    <div>
                        <p className="text-slate-800 font-semibold text-sm">{progressText || "Preparing…"}</p>
                        {progressText.includes("Downloading") && (
                            <p className="text-muted-foreground text-xs mt-1">The AI model is cached after the first download.</p>
                        )}
                        {progressText.includes("Removing") && (
                            <p className="text-muted-foreground text-xs mt-1">Analysing edges and subject…</p>
                        )}
                        {!progressText.includes("Downloading") && !progressText.includes("Removing") && (
                            <p className="text-muted-foreground text-xs mt-1">This may take up to 20 seconds on first use.</p>
                        )}
                    </div>
                </div>
            )}

            {activeFile?.settings?.isDone && activeFile?.settings?.finalUrl ? (
                <ImageComparison
                    beforeImage={activeFile.previewUrl}
                    afterImage={activeFile.settings.finalUrl}
                />
            ) : (
                <img
                    src={activeFile.previewUrl}
                    alt="Preview"
                    loading="lazy"
                    className="max-w-full max-h-full object-contain drop-shadow-sm pointer-events-none"
                    style={{ opacity: status === 'processing' ? 0.3 : 1 }}
                />
            )}
        </div>
    ) : null;

    return (
        <div className="w-full space-y-8">
            {files.length === 0 && (
                <div className="mt-6 w-full max-w-7xl mx-auto">
                    <div className="rounded-xl border border-border bg-white shadow-xl p-4 md:p-8">
                        <ImageUploader onUpload={handleUpload} />
                        <div className="mt-8 rounded-xl bg-[#0081C9]/5 p-4 text-sm text-[#0081C9] border border-[#0081C9]/20 flex gap-3 mx-auto max-w-2xl">
                            <Icon name="wand-2" size={20} className="flex-shrink-0 mt-0.5" />
                            <div>
                                <strong>100% Client-Side Privacy:</strong> Backgrounds are removed securely on your device. Images are never uploaded to a cloud server.
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ToolModal
                isOpen={files.length > 0}
                onClose={handleClearAll}
                title="Remove Background"
                files={files}
                activeIndex={activeIndex}
                setActiveIndex={setActiveIndex}
                onPrimaryAction={ (applyToAll && files.length > 1) ? (isAllReady ? handleDownload : handleProcess) : (isCurrentReady ? handleDownload : handleProcess) }
                primaryActionText={
                    <span className="flex items-center justify-center gap-2">
                        <Icon name={(applyToAll && files.length > 1 ? isAllReady : isCurrentReady) ? "download" : "wand-2"} size={18} />
                        {(applyToAll && files.length > 1) 
                          ? (isAllReady ? `Download All (${files.length} Zipped)` : `Remove Backgrounds (${files.filter(f=>!f.settings.isDone).length})`)
                          : (isCurrentReady ? "Download Image" : "Remove Background")
                        }
                    </span>
                }
                isProcessing={status === 'processing'}
                isSuccess={(applyToAll && files.length > 1) ? isAllReady : isCurrentReady}
                onDownload={handleDownload}
                customPreview={customPreview}
            >
                {activeFile && (
                    <ToolSettingsRenderer
                        title="Background Options"
                        isBatchMode={files.length > 1}
                        applyToAll={applyToAll}
                        onApplyToAllChange={setApplyToAll}
                    >
                        {/* Status Check */}
                        <div className={`p-4 rounded-xl border flex items-center gap-4 transition-colors mb-6 shadow-sm ${activeFile.settings.isDone ? 'bg-green-50 border-green-200' : 'bg-[#E8ECEF] border-transparent'}`}>
                            <div className={`p-2 rounded-full ${activeFile.settings.isDone ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-muted-foreground'}`}>
                                <Icon name={activeFile.settings.isDone ? "check" : "image"} size={20} />
                            </div>
                            <div>
                                <h3 className={`font-bold text-sm ${activeFile.settings.isDone ? 'text-green-800' : 'text-slate-800'}`}>
                                    {activeFile.settings.isDone ? "Foreground Isolated!" : "Ready for Processing"}
                                </h3>
                                <p className="text-muted-foreground mt-0.5">
                                    {activeFile.settings.isDone ? "Tweak the background or download." : "Configure settings and click Remove."}
                                </p>
                            </div>
                        </div>

                        <SettingGroup title="AI Model Setup">
                            <SelectRow
                                label="AI Model Detail"
                                value={activeFile.settings?.model}
                                onChange={(val) => handleSettingChange("model", val)}
                                disabled={activeFile.settings.isDone}
                                options={[
                                    { label: "Medium (Recommended)", value: "medium" },
                                    { label: "Small (Faster, Less detail)", value: "small" },
                                    { label: "Large (Slower, Highest detail)", value: "large" }
                                ]}
                            />
                            <p className="text-muted-foreground mt-1">If the result misses small details like hair, try Large mode and re-process.</p>

                            {activeFile.settings.isDone && (
                                <button
                                    onClick={() => updateFileSettings(activeFile.id, { isDone: false })}
                                    className="mt-3 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors border border-slate-200"
                                >
                                    Re-Run AI Model
                                </button>
                            )}
                        </SettingGroup>

                        <SettingGroup title="Output Background">
                            <SelectRow
                                label="Background Type"
                                value={activeFile.settings?.bgType}
                                onChange={(val) => handleSettingChange("bgType", val)}
                                options={[
                                    { label: "Transparent", value: "transparent" },
                                    { label: "Solid Color", value: "color" },
                                    { label: "Blur Original", value: "blur" }
                                ]}
                            />

                            {activeFile.settings?.bgType === "color" && (
                                <div className="flex items-center gap-3 w-full text-sm pt-2">
                                    <label className="font-medium text-slate-700 flex-1">
                                        Color Value
                                    </label>
                                    <input
                                        type="color"
                                        value={activeFile.settings?.bgColor}
                                        onChange={(e) => handleSettingChange("bgColor", e.target.value)}
                                        className="h-8 w-12 cursor-pointer border-none bg-transparent rounded-lg"
                                    />
                                </div>
                            )}

                            {activeFile.settings?.bgType === "blur" && (
                                <SettingRow label="Blur Intensity" value={`${activeFile.settings?.blurAmount}px`}>
                                    <input
                                        type="range"
                                        min="2"
                                        max="50"
                                        value={activeFile.settings?.blurAmount}
                                        onChange={(e) => handleSettingChange("blurAmount", parseInt(e.target.value))}
                                        className="w-full accent-[#0081C9]"
                                    />
                                </SettingRow>
                            )}
                        </SettingGroup>

                        <SettingGroup title="Export Format">
                            <SelectRow
                                label="Format"
                                value={activeFile.settings?.format}
                                onChange={(val) => handleSettingChange("format", val)}
                                disabled={activeFile.settings?.bgType === "transparent"} // Force PNG if transparent
                                options={[
                                    { label: "PNG Image", value: "image/png" },
                                    { label: "JPG Image", value: "image/jpeg" }
                                ]}
                            />
                            {activeFile.settings?.bgType === "transparent" && (
                                <p className="text-[10px] uppercase text-muted-foreground mt-1">Locked to PNG to preserve transparency</p>
                            )}

                            <div className="pt-2">
                                <ToggleRow
                                    label="Edge Feathering"
                                    description="Smooth hard edges slightly"
                                    checked={activeFile.settings?.edgeFeathering}
                                    onChange={(val) => handleSettingChange("edgeFeathering", val)}
                                />
                            </div>
                        </SettingGroup>

                    </ToolSettingsRenderer>
                )}
            </ToolModal>
        </div>
    );
}
