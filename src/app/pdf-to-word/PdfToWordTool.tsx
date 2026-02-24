"use client";

import { useState } from "react";
import { PdfUploader } from "@/components/tools/PdfUploader";
import { ToolModal } from "@/components/modal/ToolModal";
import { Icon } from "@/components/ui/Icon";
import { toast } from "sonner";
import { analyzePdf } from "@/lib/pdf-processing/pdf-analyzer";
import { convertPdfToDocx } from "@/lib/pdf-processing/pdf-to-docx";
import { useFileUpload } from "@/hooks/useFileUpload";

export default function PdfToWordTool() {
    // 1. Universal State Engine
    const {
        files,
        activeIndex,
        setActiveIndex,
        activeFile,
        addFiles,
        clearAll,
        updateFileSettings
    } = useFileUpload([]);

    // 2. Local Processing State
    const [isConverting, setIsConverting] = useState(false);
    const [useOcr, setUseOcr] = useState(false);
    const [outputFormat, setOutputFormat] = useState<'docx' | 'txt'>('docx');

    const handleUpload = async (uploadedFiles: File[]) => {
        // Enforce maximum 5 files batch limit for PDF conversion
        if (files.length + uploadedFiles.length > 5) {
            toast.error("You can only convert up to 5 PDFs at a time.");
            return;
        }

        // Add to universal store first using default structure
        addFiles(uploadedFiles, {
            status: 'analyzing',
            progress: 0,
            pageCount: 0,
            isScanned: false,
            resultUrl: null,
            error: null
        });

        const latestBatch = [...files, ...uploadedFiles.map(f => ({ id: "tmp", file: f }))];
        // Note: the hook UUID mapped files asynchronously, so we find them by matching File ref or wait a tick.
        // For simplicity, we trigger analysis iteratively on the newly pushed raw files
        for (const rawFile of uploadedFiles) {
            try {
                const analysis = await analyzePdf(rawFile);

                // We use updateAllFileSettings globally, but limit it to matching file names for safety
                // In production we'd want to return UUIDs from `addFiles` directly.

                if (analysis.isScanned) {
                    setUseOcr(true);
                    toast("Scanned PDF detected. OCR enabled automatically.");
                }

                // Temporary hack: we just update all states for now
                files.forEach(f => {
                    if (f.file.name === rawFile.name) {
                        updateFileSettings(f.id, {
                            status: 'idle',
                            pageCount: analysis.pageCount,
                            isScanned: analysis.isScanned
                        });
                    }
                });

            } catch (error) {
                console.error("Analysis Failed", error);
            }
        }
    };

    const handleConvert = async () => {
        if (files.length === 0) return;
        setIsConverting(true);

        const filesToProcess = files.filter(f => f.settings?.status === 'idle' || f.settings?.status === 'complete' || !f.settings?.status);

        for (const file of filesToProcess) {
            updateFileSettings(file.id, { status: 'converting', progress: 0 });

            try {
                const shouldOcr = useOcr || (file.settings?.isScanned ?? false);

                const blob = await convertPdfToDocx(file.file, {
                    useOcr: shouldOcr,
                    onProgress: (p) => updateFileSettings(file.id, { progress: p })
                });

                const url = URL.createObjectURL(blob);

                updateFileSettings(file.id, {
                    status: 'complete',
                    progress: 100,
                    resultUrl: url
                });

                toast.success(`Converted ${file.file.name}`);

            } catch (err: any) {
                console.error(err);
                updateFileSettings(file.id, { status: 'error', error: err.message || "Conversion failed" });
                toast.error(`Failed to convert ${file.file.name}`);
            }
        }

        setIsConverting(false);
    };

    // Helper for rendering status text safely
    const getStatusText = (settings: any) => {
        switch (settings?.status) {
            case 'analyzing': return 'Analyzing...';
            case 'converting': return `Converting... ${settings.progress || 0}%`;
            case 'complete': return 'Converted';
            case 'error': return 'Error';
            default: return 'Ready';
        }
    };

    return (
        <div className="w-full space-y-8">
            {files.length === 0 && (
                <div className="mt-6 w-full max-w-7xl mx-auto">
                    <div className="bg-card rounded-2xl shadow-xl shadow-primary/5 border border-border/50 p-2 md:p-4">
                        <PdfUploader onUpload={handleUpload} />
                    </div>
                </div>
            )}

            <ToolModal
                isOpen={files.length > 0}
                onClose={clearAll}
                title="Convert PDF to Word"
                files={files}
                activeIndex={activeIndex}
                setActiveIndex={setActiveIndex}
                onPrimaryAction={handleConvert}
                primaryActionText={
                    <span className="flex items-center justify-center gap-2">
                        <Icon name="file-text" size={18} />
                        {files.length > 1 ? "Convert All PDFs" : "Convert to Word"}
                    </span>
                }
                isProcessing={isConverting}
            >
                {/* TOOL SPECIFIC SIDEBAR CONTENT */}
                {activeFile && (
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 mb-6 font-sans">Convert to Word</h2>

                            {/* File Info Box */}
                            <div className="bg-[#E8ECEF] rounded-xl p-4 flex flex-col gap-3 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="bg-white p-2 rounded-lg shadow-sm">
                                        <Icon name="file-text" size={24} className="text-[#0081C9]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-slate-800 truncate text-sm">{activeFile.file.name}</p>
                                        <p className="text-xs text-slate-500 mt-0.5 font-medium">
                                            {(activeFile.file.size / 1024 / 1024).toFixed(2)} MB
                                            {activeFile.settings?.pageCount > 0 && ` • ${activeFile.settings.pageCount} Pages`}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-xs font-semibold pt-3 border-t border-slate-300">
                                    <span className="text-slate-500 uppercase tracking-wider text-[10px]">Status</span>
                                    <span className={
                                        activeFile.settings?.status === 'complete' ? 'text-green-600' :
                                            activeFile.settings?.status === 'error' ? 'text-red-600' :
                                                activeFile.settings?.status === 'converting' ? 'text-yellow-600 animate-pulse' :
                                                    'text-[#0081C9]'
                                    }>
                                        {getStatusText(activeFile.settings)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {activeFile.settings?.status === 'complete' && activeFile.settings?.resultUrl && (
                            <a href={activeFile.settings.resultUrl} download={`${activeFile.file.name.replace('.pdf', '')}.docx`}>
                                <button className="w-full flex items-center justify-center gap-2 h-12 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-semibold shadow-md shadow-green-600/20">
                                    <Icon name="download" size={18} /> Download DOCX
                                </button>
                            </a>
                        )}

                        {/* Conversion Settings */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-slate-800">Conversion Options</h3>

                            <div className="space-y-3">
                                {/* OCR Toggle styled like Apple switches */}
                                <div className="flex items-center justify-between p-3.5 bg-white border border-slate-300 rounded-xl shadow-sm">
                                    <div className="space-y-0.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 block mb-1">OCR Mode</label>
                                        <p className="text-xs text-slate-500 font-medium">Force text recognition on scanned PDFs</p>
                                    </div>
                                    <button
                                        onClick={() => setUseOcr(!useOcr)}
                                        type="button"
                                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${useOcr ? 'bg-[#0081C9]' : 'bg-slate-300'}`}
                                    >
                                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${useOcr ? 'translate-x-5' : 'translate-x-0'}`} />
                                    </button>
                                </div>

                                {/* Output Format Toggle Map */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 block mb-1">Output Format</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => setOutputFormat('docx')}
                                            className={`h-11 rounded-lg text-sm font-semibold border transition-all ${outputFormat === 'docx'
                                                ? "bg-[#0081C9]/5 text-[#0081C9] border-[#0081C9]/50 ring-1 ring-[#0081C9]/20 shadow-sm"
                                                : "bg-white border-slate-300 text-slate-600 hover:bg-slate-50"
                                                }`}
                                        >
                                            DOCX (Word)
                                        </button>
                                        <button
                                            onClick={() => setOutputFormat('txt')}
                                            disabled
                                            className="h-11 rounded-lg text-sm font-semibold border border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed opacity-70"
                                        >
                                            TXT (Soon)
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                )}
            </ToolModal>
        </div>
    );
}
