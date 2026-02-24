"use client";

import { useState, useEffect } from "react";
import { ImageUploader } from "@/components/tools/ImageUploader";
import { ToolModal } from "@/components/modal/ToolModal";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import { Icon } from "@/components/ui/Icon";
import { removeBackground, Config } from "@imgly/background-removal";
import { useFileUpload } from "@/hooks/useFileUpload";

export default function RemoveBgTool() {
    const {
        files,
        activeIndex,
        setActiveIndex,
        activeFile,
        addFiles,
        clearAll,
        updateFileSettings
    } = useFileUpload([]);

    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState<string>("");
    const [showComparison, setShowComparison] = useState(false);
    const [longLoading, setLongLoading] = useState(false);

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

    const handleUpload = (uploadedFiles: File[]) => {
        addFiles(uploadedFiles, {
            processedUrl: null,
            isDone: false
        });
    };

    const handleProcess = async () => {
        if (!activeFile || activeFile.settings.isDone) return;

        setIsProcessing(true);
        setProgress("Preparing AI engine (first time only)…");

        try {
            const config: Config = {
                progress: (key: string, current: number, total: number) => {
                    if (key === "compute:inference") {
                        const percent = Math.round((current / total) * 100);
                        setProgress(`Removing Background... ${percent}%`);
                    }
                },
                debug: false
            };

            const blob = await removeBackground(activeFile.file, config);
            const resultUrl = URL.createObjectURL(blob);

            updateFileSettings(activeFile.id, {
                processedUrl: resultUrl,
                isDone: true
            });

            toast.success("Background removed successfully!");
        } catch (error) {
            console.error("Background removal failed:", error);
            toast.error("Failed to remove background. Please try again.");
        } finally {
            setIsProcessing(false);
            setProgress("");
            setLongLoading(false);
        }
    };

    const handleDownload = () => {
        const urlToDownload = activeFile?.settings?.processedUrl;
        if (!urlToDownload) return;

        const link = document.createElement("a");
        link.href = urlToDownload;
        const baseName = activeFile.file.name.substring(0, activeFile.file.name.lastIndexOf('.')) || activeFile.file.name;
        link.download = `removed_bg_${baseName}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const isDone = activeFile?.settings?.isDone;

    // CUSTOM PREVIEW RENDERING FOR THE LEFT STAGE
    const customPreview = activeFile ? (
        <div className="w-full h-full flex flex-col items-center justify-center relative p-4 bg-slate-100 bg-[linear-gradient(45deg,#ccc_25%,transparent_25%,transparent_75%,#ccc_75%,#ccc),linear-gradient(45deg,#ccc_25%,transparent_25%,transparent_75%,#ccc_75%,#ccc)] bg-[length:20px_20px] bg-[position:0_0,10px_10px]">
            {isProcessing ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-md z-50 text-center p-6">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#0081C9] border-t-transparent" />
                    <p className="mt-4 font-bold text-slate-800 text-lg">{progress}</p>

                    {!progress.includes("Removing") && (
                        <p className="text-sm text-slate-500 font-medium mt-2">This may take 10–20 seconds.</p>
                    )}

                    {longLoading && (
                        <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-700 text-sm max-w-xs shadow-sm">
                            <p className="font-bold flex items-center justify-center gap-2 mb-1">
                                <Icon name="alert-triangle" size={16} /> Note
                            </p>
                            <p className="font-medium">AI model is loading slightly longer than expected on your connection.</p>
                        </div>
                    )}
                </div>
            ) : null}

            {/* Image Container */}
            <div className="relative max-w-full max-h-[80vh] flex items-center justify-center">
                {isDone && activeFile.settings?.processedUrl ? (
                    <>
                        {/* Base: Processed Image (Always visible, sets layout) */}
                        <img
                            src={activeFile.settings.processedUrl}
                            alt="Processed"
                            className="max-w-full max-h-[60vh] md:max-h-[80vh] object-contain relative z-10 drop-shadow-md"
                        />

                        {/* Overlay: Original Image (Fades in on hover/hold) */}
                        <img
                            src={activeFile.previewUrl}
                            alt="Original"
                            className={`absolute inset-0 w-full h-full object-contain z-20 transition-opacity duration-300 ${showComparison ? "opacity-100" : "opacity-0"
                                }`}
                        />
                    </>
                ) : (
                    /* Loading State: Blur Original */
                    <img
                        src={activeFile.previewUrl}
                        alt="Processing preview"
                        className="max-w-full max-h-[60vh] md:max-h-[80vh] object-contain opacity-50 blur-md grayscale-[20%]"
                    />
                )}
            </div>

            {/* Hold to Compare control - overlaying the preview at bottom center */}
            {!isProcessing && isDone && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30">
                    <Button
                        variant="secondary"
                        onPointerDown={(e) => {
                            e.preventDefault();
                            setShowComparison(true);
                        }}
                        onPointerUp={(e) => {
                            e.preventDefault();
                            setShowComparison(false);
                        }}
                        onPointerLeave={() => setShowComparison(false)}
                        style={{ touchAction: "none" }}
                        className="select-none active:scale-95 transition-transform shadow-lg bg-white/90 backdrop-blur border border-slate-200 font-bold text-slate-700 rounded-full px-6 py-2.5 h-auto text-sm"
                    >
                        <Icon name="eye" size={16} className="mr-2 text-[#0081C9]" />
                        Hold to Compare
                    </Button>
                </div>
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
                                <strong>Automatic AI:</strong> Background is removed entirely locally within your browser using WebGL and WASM. Your image is never uploaded to any server.
                            </div>
                        </div>
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
                onPrimaryAction={isDone ? handleDownload : handleProcess}
                primaryActionText={
                    isDone ? (
                        <span className="flex items-center justify-center gap-2">
                            <Icon name="download" size={18} />
                            Download PNG
                        </span>
                    ) : (
                        <span className="flex items-center justify-center gap-2">
                            <Icon name="wand-2" size={18} />
                            Remove Background
                        </span>
                    )
                }
                isProcessing={isProcessing}
                customPreview={customPreview}
            >
                {/* TOOL SPECIFIC SIDEBAR CONTENT */}
                {activeFile && (
                    <div className="space-y-8">
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-slate-800 font-sans">AI Isolation</h2>
                                {isDone && (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                        <Icon name="check-circle" size={14} />
                                        Complete
                                    </span>
                                )}
                            </div>

                            {/* File Info Block */}
                            <div className="bg-[#E8ECEF] rounded-xl p-4 flex flex-col gap-3 shadow-sm border border-transparent">
                                <div className="flex items-center gap-3">
                                    <div className="bg-white p-2 rounded-lg shadow-sm">
                                        <Icon name="image" size={24} className="text-[#0081C9]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-slate-800 truncate text-sm" title={activeFile.file.name}>
                                            {activeFile.file.name}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-0.5 font-medium flex gap-2">
                                            <span>Format: PNG</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Settings / Results Data */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-slate-800">Status Output</h3>

                            <div className={`p-4 rounded-xl border flex items-start gap-3 transition-colors ${isDone ? 'bg-[#0081C9]/5 border-[#0081C9]/20' : 'bg-[#E8ECEF] border-transparent animate-pulse'
                                }`}>
                                <Icon name={isDone ? "aperture" : "loader-2"} size={18} className={`${isDone ? 'text-[#0081C9]' : 'text-slate-500 animate-spin'} mt-0.5`} />
                                <div>
                                    <p className={`text-sm font-semibold ${isDone ? 'text-[#0081C9]' : 'text-slate-600'}`}>
                                        {isDone ? 'Foreground Isolated' : 'Processing Image...'}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1 font-medium">
                                        {isDone
                                            ? 'The background has been removed. The output preserves transparency.'
                                            : 'Please wait while the AI model separates the foreground from the background.'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Security Badge inline */}
                        <div className="flex items-center gap-2 justify-center text-[10px] text-slate-400 font-medium pt-4 border-t border-slate-100">
                            <Icon name="zap" size={14} />
                            <span>Locally powered by @imgly/background-removal</span>
                        </div>
                    </div>
                )}
            </ToolModal>
        </div>
    );
}
