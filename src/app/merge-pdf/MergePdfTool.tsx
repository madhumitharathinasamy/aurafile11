"use client";

import { useState } from "react";
import { PdfUploader } from "@/components/tools/PdfUploader";
import { ToolModal } from "@/components/modal/ToolModal";
import { toast } from "sonner";
import { Icon } from "@/components/ui/Icon";
import { PDFDocument } from "pdf-lib";
import { useFileUpload } from "@/hooks/useFileUpload";

export default function MergePdfTool() {
    const {
        files,
        setFiles,
        activeIndex,
        setActiveIndex,
        activeFile,
        addFiles,
        removeFile,
        clearAll
    } = useFileUpload([]);

    const [isProcessing, setIsProcessing] = useState(false);
    const [mergedUrl, setMergedUrl] = useState<string | null>(null);

    const handleUpload = (newFiles: File[]) => {
        addFiles(newFiles);
        setMergedUrl(null);
    };

    const moveFile = (index: number, direction: 'up' | 'down') => {
        if (
            (direction === 'up' && index === 0) ||
            (direction === 'down' && index === files.length - 1)
        ) return;

        setFiles(prev => {
            const newFiles = [...prev];
            const targetIndex = direction === 'up' ? index - 1 : index + 1;
            [newFiles[index], newFiles[targetIndex]] = [newFiles[targetIndex], newFiles[index]];
            return newFiles;
        });
        setMergedUrl(null);
    };

    const handleMerge = async () => {
        if (files.length < 2) {
            toast.error("Please select at least 2 PDF files to merge.");
            return;
        }

        setIsProcessing(true);
        try {
            const mergedPdf = await PDFDocument.create();

            for (const fileState of files) {
                const arrayBuffer = await fileState.file.arrayBuffer();
                const pdf = await PDFDocument.load(arrayBuffer);
                const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                copiedPages.forEach((page: any) => mergedPdf.addPage(page));
            }

            const pdfBytes = await mergedPdf.save({ useObjectStreams: false });
            const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            setMergedUrl(url);
            toast.success("PDFs merged successfully!");

        } catch (error) {
            console.error(error);
            toast.error("Failed to merge PDFs. One of the files might be corrupted.");
        } finally {
            setIsProcessing(false);
        }
    };

    const downloadFile = async () => {
        if (!mergedUrl) return;

        try {
            const response = await fetch(mergedUrl);
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = `merged_document_${new Date().getTime()}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error("Download failed:", error);
            toast.error("Failed to download merged PDF safely.");
        }
    };

    const handlePrimaryAction = () => {
        if (mergedUrl) {
            downloadFile();
        } else {
            handleMerge();
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
                                <strong>Secure Processing:</strong> Your files are merged entirely in your web browser. They are never uploaded to any server.
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ToolModal
                isOpen={files.length > 0}
                onClose={clearAll}
                title="Merge PDF"
                files={files}
                activeIndex={activeIndex}
                setActiveIndex={setActiveIndex}
                onPrimaryAction={handlePrimaryAction}
                primaryActionText={
                    <span className="flex items-center justify-center gap-2">
                        {mergedUrl ? (
                            <>
                                <Icon name="download" size={18} />
                                Download Merged PDF
                            </>
                        ) : (
                            <>
                                <Icon name="files" size={18} />
                                Merge PDF Files
                            </>
                        )}
                    </span>
                }
                isProcessing={isProcessing}
            >
                {/* TOOL SPECIFIC SIDEBAR CONTENT */}
                <div className="space-y-8">
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-slate-800 font-sans">Document Order</h2>
                            {mergedUrl && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                    <Icon name="check-circle" size={14} />
                                    Combined
                                </span>
                            )}
                        </div>

                        {/* Stats Info Box */}
                        <div className="bg-[#E8ECEF] rounded-xl p-4 flex flex-col gap-3 shadow-sm mb-6">
                            <div className="flex items-center gap-3">
                                <div className="bg-white p-2 rounded-lg shadow-sm">
                                    <Icon name="layers" size={24} className="text-[#0081C9]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-slate-800 truncate text-sm">
                                        {files.length} Document{files.length !== 1 ? 's' : ''} Uploaded
                                    </p>
                                    <p className="text-xs text-slate-500 mt-0.5 font-medium">
                                        Use the arrows below to order them.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-slate-800">Files to Merge</h3>

                        <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                            {files.map((fileState, index) => (
                                <div key={fileState.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-[#0081C9]/50 transition-colors">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="bg-[#E8ECEF] p-2 rounded-lg text-slate-600 flex-shrink-0 relative group">
                                            <Icon name="file-text" size={18} />
                                            {index === activeIndex && (
                                                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#0081C9] rounded-full border-2 border-white"></div>
                                            )}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="truncate text-xs font-semibold text-slate-700" title={fileState.file.name}>
                                                {fileState.file.name}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-medium">
                                                {(fileState.size / 1024).toFixed(1)} KB
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-0.5 bg-[#E8ECEF] rounded-lg p-0.5 flex-shrink-0">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); moveFile(index, 'up'); }}
                                            disabled={index === 0 || !!mergedUrl}
                                            className="p-1.5 text-slate-400 hover:text-[#0081C9] hover:bg-white rounded-md disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-all"
                                            title="Move Up"
                                        >
                                            <Icon name="chevron-up" size={14} />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); moveFile(index, 'down'); }}
                                            disabled={index === files.length - 1 || !!mergedUrl}
                                            className="p-1.5 text-slate-400 hover:text-[#0081C9] hover:bg-white rounded-md disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-all"
                                            title="Move Down"
                                        >
                                            <Icon name="chevron-down" size={14} />
                                        </button>
                                        <div className="w-px h-4 bg-slate-300 mx-0.5"></div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); removeFile(fileState.id); }}
                                            disabled={!!mergedUrl}
                                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-white rounded-md disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-all"
                                            title="Remove File"
                                        >
                                            <Icon name="x" size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </ToolModal>
        </div>
    );
}
