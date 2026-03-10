"use client";

import { useState, useCallback, useEffect } from "react";
import { ImageUploader } from "@/components/tools/ImageUploader";
import { ToolModal } from "@/components/modal/ToolModal";
import { ImageComparison } from "@/components/tools/ImageComparison";
import { Icon } from "@/components/ui/Icon";
import { toast } from "sonner";
import { useFileUpload, type IntegratedFile } from "@/hooks/useFileUpload";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { ToolSettingsRenderer, SettingGroup, ToggleRow } from "@/components/tools/ToolSettingsRenderer";

interface RemoveBgSettings {
    highQuality: boolean;

    // Output stats
    isRemoved: boolean;
    removedUrl: string | null;
    removedBlob: Blob | null;
}

const DEFAULT_SETTINGS: RemoveBgSettings = {
    highQuality: false, // Default to the faster fp16 model for better UX
    isRemoved: false,
    removedUrl: null,
    removedBlob: null
};

interface ProgressStat {
    status: 'fetching' | 'computing' | 'done';
    percentage: number;
    message: string;
}

export default function RemoveBackgroundTool() {
    const {
        files,
        activeIndex,
        setActiveIndex,
        activeFile,
        addFiles,
        clearAll,
        updateFileSettings,
        updateAllFileSettings,
        isBatchMode
    } = useFileUpload([]);

    const [isProcessing, setIsProcessing] = useState(false);
    const [applyToAll, setApplyToAll] = useState(false);
    const [progressStats, setProgressStats] = useState<Record<string, ProgressStat>>({});

    async function processSingleFile(currentFile: IntegratedFile) {
        try {

            // Dynamically import to drastically reduce initial page bundle size!
            const imgly = await import("@imgly/background-removal");
            const imglyRemoveBackground = imgly.removeBackground;

            // Determine model logic based on highQuality setting
            const modelIdentifier = currentFile.settings.highQuality ? "isnet" : "isnet_fp16";

            // Initialize progress
            setProgressStats(prev => ({
                ...prev,
                [currentFile.id]: { status: 'fetching', percentage: 0, message: 'Initializing AI Engine...' }
            }));

            // Execute imgly background removal
            const imageBlob = await imglyRemoveBackground(currentFile.file, {
                debug: false,
                model: modelIdentifier,
                progress: (key, current, total) => {
                    if (key.startsWith('fetch:')) {
                        const pct = total ? Math.round((current / total) * 100) : 0;
                        setProgressStats(prev => ({
                            ...prev,
                            [currentFile.id]: { status: 'fetching', percentage: pct, message: pct === 100 ? 'AI Model Loaded' : `Loading AI Model (${pct}%)` }
                        }));
                    } else if (key.startsWith('compute:')) {
                        const pct = total ? Math.round((current / total) * 100) : 0;
                        setProgressStats(prev => ({
                            ...prev,
                            [currentFile.id]: { status: 'computing', percentage: pct, message: `Removing Background (${pct}%)` }
                        }));
                    }
                }
            });

            setProgressStats(prev => ({
                ...prev,
                [currentFile.id]: { status: 'done', percentage: 100, message: 'Done' }
            }));

            const removedUrl = URL.createObjectURL(imageBlob);

            updateFileSettings(currentFile.id, {
                isRemoved: true,
                removedUrl: removedUrl,
                removedBlob: imageBlob
            });
            return true;
        } catch (e) {
            toast.error(`Error processing ${currentFile.file.name}.`);
            return false;
        }
    }

    // Debounced auto-preview
    // For background removal, we might not want to auto-preview every time since it's heavy, 
    // but we can trigger it once on load if needed.
    const activeSettingsStr = activeFile ? JSON.stringify({
        hq: activeFile.settings.highQuality
    }) : "";

    useEffect(() => {
        if (!activeFile) return;
        if (activeFile.settings.isRemoved) return;

        const timer = setTimeout(async () => {
            setIsProcessing(true);
            await processSingleFile(activeFile);
            setIsProcessing(false);
        }, 1000); // Longer debounce for heavy ML task

        return () => clearTimeout(timer);
    }, [activeSettingsStr, activeFile]);

    const handleUpload = async (uploadedFiles: File[]) => {
        addFiles(uploadedFiles, { ...DEFAULT_SETTINGS });
    };

    const handleSettingChange = (key: keyof RemoveBgSettings, value: any) => {
        if (!activeFile) return;

        const updates = { [key]: value, isRemoved: false };
        if (applyToAll && isBatchMode) {
            updateAllFileSettings(updates);
        } else {
            updateFileSettings(activeFile.id, updates);
        }
    };

    const handleProcessAll = async () => {
        if (!applyToAll || !isBatchMode) return;
        setIsProcessing(true);
        let successCount = 0;
        let failCount = 0;

        for (const file of files) {
            const success = await processSingleFile(file);
            if (success) successCount++;
            else failCount++;
        }

        setIsProcessing(false);
        if (failCount === 0) {
            toast.success(`Successfully removed backgrounds for all ${successCount} images!`);
        } else {
            toast.warning(`Finished: ${successCount} successful, ${failCount} failed.`);
        }
    };



    const isAllProcessed = files.length > 0 && files.every(f => f.settings.isRemoved && f.settings.removedUrl);
    const isCurrentProcessed = activeFile && activeFile.settings.isRemoved && activeFile.settings.removedUrl;

    const handleDownload = async () => {
        try {
            if (applyToAll && isBatchMode && isAllProcessed) {
                toast.info("Preparing ZIP file...");
                const zip = new JSZip();

                for (const fileMeta of files) {
                    if (!fileMeta.settings.removedBlob) continue;
                    const blob = fileMeta.settings.removedBlob;

                    const originalName = fileMeta.file.name.substring(0, fileMeta.file.name.lastIndexOf('.')) || fileMeta.file.name;
                    zip.file(`${originalName}-nobg.png`, blob); // Always PNG to preserve transparency
                }

                const content = await zip.generateAsync({ type: "blob" });
                saveAs(content, "aurafile-nobg.zip");
                toast.success("Downloaded ZIP file!");
            } else if (activeFile && isCurrentProcessed) {
                const blob = activeFile.settings.removedBlob!;

                const originalName = activeFile.file.name.substring(0, activeFile.file.name.lastIndexOf('.')) || activeFile.file.name;
                saveAs(blob, `${originalName}-nobg.png`);
            }
        } catch (error) {
            toast.error("Failed to download processed images.");
        }
    };

    const getPrimaryActionText = () => {
        if (isProcessing) return "Processing AI...";
        if (applyToAll && isBatchMode) {
            return isAllProcessed ? `Download All (${files.length} Zipped)` : `Remove Backgrounds (${files.length})`;
        }
        return isCurrentProcessed ? "Download Image" : "Remove Background";
    };

    const handlePrimaryAction = () => {
        if (applyToAll && isBatchMode && isAllProcessed) {
            handleDownload();
        } else if (!applyToAll && isCurrentProcessed) {
            handleDownload();
        } else if (applyToAll && isBatchMode) {
            handleProcessAll();
        } else {
            setIsProcessing(true);
            processSingleFile(activeFile).then(() => setIsProcessing(false));
        }
    };

    return (
        <div className="w-full space-y-8">
            {files.length === 0 && (
                <div className="mt-6 w-full max-w-7xl mx-auto">
                    <div className="rounded-2xl border border-border bg-surface shadow-xl p-4 md:p-8 backdrop-blur-sm">
                        <ImageUploader onUpload={handleUpload} />
                    </div>
                </div>
            )}

            <ToolModal
                isOpen={files.length > 0}
                onClose={clearAll}
                title="Remove Background"
                files={files}
                activeIndex={activeIndex}
                setActiveIndex={setActiveIndex}
                onPrimaryAction={handlePrimaryAction}
                primaryActionText={
                    <span className="flex items-center justify-center gap-2">
                        <Icon name={((applyToAll && isBatchMode && isAllProcessed) || (!applyToAll && isCurrentProcessed)) ? "download" : "scissors"} size={18} />
                        {getPrimaryActionText()}
                    </span>
                }
                isProcessing={isProcessing}
                customPreview={
                    (() => {
                        if (activeFile?.settings.isRemoved && activeFile.settings.removedUrl) {
                            return (
                                <div className="w-full h-full flex items-center justify-center p-4 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxyZWN0IHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0iI2ZmZiIgLz4KPHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZWVlIiAvPgo8cmVjdCB4PSIxMCIgeT0iMTAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0iI2VlZSIgLz4KPC9zdmc+')]">
                                    <ImageComparison
                                        beforeImage={activeFile.previewUrl}
                                        afterImage={activeFile.settings.removedUrl}
                                    />
                                </div>
                            );
                        } else if (activeFile && progressStats[activeFile.id] && progressStats[activeFile.id].status !== 'done') {
                            const stat = progressStats[activeFile.id];
                            return (
                                <div className="w-full h-full p-4 md:p-8 flex items-center justify-center">
                                    <div className="flex flex-col items-center justify-center text-muted-foreground h-full border-2 border-dashed border-border/50 rounded-xl w-full bg-slate-50 max-w-sm mx-auto shadow-sm">
                                        <div className="relative w-16 h-16 mb-6">
                                            <Icon name={stat.status === 'fetching' ? 'download' : 'cpu'} size={32} className="absolute inset-0 m-auto text-primary z-10" />
                                            <svg className="animate-spin absolute inset-0 text-primary/20 w-16 h-16 z-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        </div>
                                        <p className="font-semibold text-slate-800 text-center mb-4 truncate w-full px-4" title={stat.message}>
                                            {stat.message}
                                        </p>
                                        <div className="w-4/5 bg-slate-200 rounded-full h-2.5 overflow-hidden">
                                            <div
                                                className="bg-primary h-2.5 rounded-full transition-all duration-200 ease-out flex items-center justify-end"
                                                style={{ width: `${stat.percentage}%` }}
                                            >
                                                <div className="w-2 h-2 bg-white/40 rounded-full mr-1 animate-pulse"></div>
                                            </div>
                                        </div>
                                        <p className="text-xs text-slate-400 mt-4 text-center px-4">
                                            {stat.status === 'fetching' && "Reading the ML model from your browser cache (or downloading if first time)."}
                                            {stat.status === 'computing' && "Running neural network over your image pixels securely."}
                                        </p>
                                    </div>
                                </div>
                            );
                        }
                        return undefined;
                    })()
                }
            >
                {activeFile && (
                    <ToolSettingsRenderer
                        title="AI Settings"
                        isBatchMode={isBatchMode}
                        applyToAll={applyToAll}
                        onApplyToAllChange={setApplyToAll}
                    >
                        <SettingGroup title="AI Model Tuning">
                            <ToggleRow
                                label="High Quality Model"
                                description="Uses a larger model for better edges (slower)"
                                checked={activeFile.settings.highQuality}
                                onChange={(val) => handleSettingChange("highQuality", val)}
                            />
                        </SettingGroup>
                        <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 text-sm text-foreground my-4">
                            <p className="flex items-center gap-2 font-semibold mb-1 text-primary">
                                <Icon name="zap" size={16} /> 100% Client-Side Private AI
                            </p>
                            <p className="text-muted-foreground text-xs leading-relaxed">
                                The AI model runs entirely in your browser using WebAssembly. Note: the first time you use this tool, it may take 5-15 seconds to download the model into your browser. After that, it securely loads from your local cache.
                            </p>
                        </div>
                    </ToolSettingsRenderer>
                )}
            </ToolModal>
        </div>
    );
}
