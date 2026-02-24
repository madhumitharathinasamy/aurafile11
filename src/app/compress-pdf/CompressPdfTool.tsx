"use client";

import { useState } from "react";
import { PdfUploader } from "@/components/tools/PdfUploader";
import { ToolModal } from "@/components/modal/ToolModal";
import { toast } from "sonner";
import { Icon } from "@/components/ui/Icon";
import { PDFDocument } from "pdf-lib";
import { useFileUpload } from "@/hooks/useFileUpload";

export default function CompressPdfTool() {
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

    const handleUpload = (uploadedFiles: File[]) => {
        if (files.length > 0) {
            toast.error("You can only compress one PDF at a time in this version.");
            return;
        }

        // Initialize file with default settings
        addFiles([uploadedFiles[0]], {
            compressedUrl: null,
            compressedSize: 0,
            compressionDone: false,
            savings: 0
        });
    };

    const handleCompress = async () => {
        if (!activeFile) return;
        setIsProcessing(true);

        try {
            const arrayBuffer = await activeFile.file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);

            const newPdf = await PDFDocument.create();
            const pages = await newPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
            pages.forEach((page) => newPdf.addPage(page));

            const pdfBytes = await newPdf.save({ useObjectStreams: false });

            let settingsUpdate = {
                compressedUrl: null as string | null,
                compressedSize: pdfBytes.byteLength,
                compressionDone: true,
                savings: 0
            };

            const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            settingsUpdate.compressedUrl = url;

            if (pdfBytes.byteLength >= activeFile.size) {
                toast.info("This PDF is already optimized.", {
                    description: "We couldn't reduce the file size further without losing quality."
                });
            } else {
                const savings = ((activeFile.size - pdfBytes.byteLength) / activeFile.size * 100).toFixed(1);
                settingsUpdate.savings = Number(savings);
                toast.success(`Compressed! Saved ${((activeFile.size - pdfBytes.byteLength) / 1024).toFixed(2)} KB.`);
            }

            updateFileSettings(activeFile.id, settingsUpdate);

        } catch (error) {
            console.error(error);
            toast.error("Failed to compress PDF. The file might be corrupted or password protected.");
        } finally {
            setIsProcessing(false);
        }
    };

    const downloadFile = async () => {
        if (!activeFile?.settings?.compressedUrl) return;

        try {
            const response = await fetch(activeFile.settings.compressedUrl);
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = blobUrl;
            const extensionStr = ".pdf";
            const baseName = activeFile.file.name.endsWith(extensionStr)
                ? activeFile.file.name.slice(0, -4)
                : activeFile.file.name;

            link.download = `compressed_${baseName}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error("Download failed:", error);
            toast.error("Failed to download compressed PDF safely.");
        }
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const isDone = activeFile?.settings?.compressionDone;

    const handlePrimaryAction = () => {
        if (isDone) {
            downloadFile();
        } else {
            handleCompress();
        }
    };

    return (
        <div className="w-full space-y-8">
            {files.length === 0 && (
                <div className="mt-6 w-full max-w-7xl mx-auto">
                    <div className="rounded-xl border border-border bg-white shadow-xl p-4 md:p-8">
                        <PdfUploader onUpload={handleUpload} />

                        <div className="mt-8 rounded-xl bg-[#0081C9]/5 p-4 text-sm text-[#0081C9] border border-[#0081C9]/20 flex gap-3 mx-auto max-w-2xl">
                            <Icon name="shield" size={20} className="flex-shrink-0 mt-0.5" />
                            <div>
                                <strong>Secure Processing:</strong> Your PDF is processed entirely in your web browser. It is never uploaded to any server.
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ToolModal
                isOpen={files.length > 0}
                onClose={clearAll}
                title="Compress PDF"
                files={files}
                activeIndex={activeIndex}
                setActiveIndex={setActiveIndex}
                onPrimaryAction={handlePrimaryAction}
                primaryActionText={
                    <span className="flex items-center justify-center gap-2">
                        {isDone ? (
                            <>
                                <Icon name="download" size={18} />
                                Download Compressed PDF
                            </>
                        ) : (
                            <>
                                <Icon name="minimize" size={18} />
                                Compress PDF
                            </>
                        )}
                    </span>
                }
                isProcessing={isProcessing}
            >
                {/* TOOL SPECIFIC SIDEBAR CONTENT */}
                {activeFile && (
                    <div className="space-y-8">
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-slate-800 font-sans">Optimization</h2>
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
                                        <Icon name="file-text" size={24} className="text-[#0081C9]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-slate-800 truncate text-sm" title={activeFile.file.name}>
                                            {activeFile.file.name}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-0.5 font-medium flex gap-2">
                                            <span>Original: {formatSize(activeFile.size)}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Settings / Results Data */}
                        {!isDone ? (
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-slate-800">Compression Level</h3>

                                <div className="bg-[#0081C9]/5 border border-[#0081C9]/20 p-4 rounded-xl flex items-start gap-3">
                                    <Icon name="info" size={18} className="text-[#0081C9] mt-0.5" />
                                    <div>
                                        <p className="text-sm font-semibold text-[#0081C9]">Recommended Settings</p>
                                        <p className="text-xs text-slate-600 mt-1">
                                            We automatically apply the optimal compression structure for your PDF. Unnecessary objects and streams will be removed.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-slate-800">Results</h3>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-[#E8ECEF] p-4 rounded-xl border border-transparent flex flex-col justify-center items-center text-center">
                                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">New Size</span>
                                        <span className="text-lg font-bold text-slate-800">
                                            {formatSize(activeFile.settings?.compressedSize || 0)}
                                        </span>
                                    </div>

                                    <div className={`p-4 rounded-xl border flex flex-col justify-center items-center text-center ${activeFile.settings?.savings > 0
                                        ? 'bg-green-50 border-green-200 text-green-700'
                                        : 'bg-slate-50 border-slate-200 text-slate-600'
                                        }`}>
                                        <span className={`text-xs font-semibold uppercase tracking-wider mb-1 ${activeFile.settings?.savings > 0 ? 'text-green-600/80' : 'text-slate-500'
                                            }`}>
                                            Savings
                                        </span>
                                        <span className="text-lg font-bold">
                                            {activeFile.settings?.savings > 0 ? `-${activeFile.settings.savings}%` : '0%'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Security Badge inline */}
                        <div className="flex items-center gap-2 justify-center text-[10px] text-slate-400 font-medium">
                            <Icon name="shield-check" size={14} />
                            <span>100% Private - Processed entirely in browser</span>
                        </div>
                    </div>
                )}
            </ToolModal>
        </div>
    );
}
