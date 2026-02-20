"use client";

import { useState, useCallback, useEffect } from "react";
import { PdfUploader } from "@/components/tools/PdfUploader";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import { Icon } from "@/components/ui/Icon";
import { PdfFile, PdfToWordStatus } from "./types";
import { analyzePdf } from "@/lib/pdf-processing/pdf-analyzer";
import { convertPdfToDocx } from "@/lib/pdf-processing/pdf-to-docx";

export default function PdfToWordTool() {
    // State
    const [files, setFiles] = useState<PdfFile[]>([]);

    // Settings State
    const [useOcr, setUseOcr] = useState(false);
    const [outputFormat, setOutputFormat] = useState<'docx' | 'txt'>('docx');

    // Cleanup URLs on unmount
    useEffect(() => {
        return () => {
            files.forEach(f => {
                if (f.resultUrl) URL.revokeObjectURL(f.resultUrl);
            });
        };
    }, []);

    const handleUpload = useCallback(async (uploadedFiles: File[]) => {
        const newFiles: PdfFile[] = uploadedFiles.map(file => ({
            id: crypto.randomUUID(),
            file,
            status: 'analyzing', // Start analyzing immediately
            progress: 0,
            pageCount: 0,
            settings: {
                useOcr: false // Will be updated by analysis
            }
        }));

        setFiles(prev => [...prev, ...newFiles]);

        // Analyze each file
        for (const pdfFile of newFiles) {
            try {
                const analysis = await analyzePdf(pdfFile.file);

                setFiles(prev => prev.map(f => {
                    if (f.id === pdfFile.id) {
                        return {
                            ...f,
                            status: 'idle',
                            isScanned: analysis.isScanned,
                            pageCount: analysis.pageCount,
                            // Auto-enable OCR if scanned
                            settings: {
                                ...f.settings!,
                                useOcr: analysis.isScanned
                            }
                        };
                    }
                    return f;
                }));

                if (analysis.isScanned) {
                    setUseOcr(true); // Global toggle follows latest file
                    toast("Scanned PDF detected. OCR enabled automatically.");
                }

            } catch (error) {
                console.error("Analysis Failed", error);
                setFiles(prev => prev.map(f =>
                    f.id === pdfFile.id ? { ...f, status: 'error', error: 'Failed to analyze PDF' } : f
                ));
            }
        }
    }, []);

    const handleConvert = async () => {
        const filesToProcess = files.filter(f => f.status === 'idle' || f.status === 'complete');
        if (filesToProcess.length === 0) return;

        for (const file of filesToProcess) {
            updateFileStatus(file.id, 'converting', 0);

            try {
                // Determine OCR setting: Use global toggle override OR file-specific auto-detection
                // For now, let's use the global toggle as the primary control
                const shouldOcr = useOcr || (file.isScanned ?? false);

                const blob = await convertPdfToDocx(file.file, {
                    useOcr: shouldOcr,
                    onProgress: (p) => updateFileStatus(file.id, 'converting', p)
                });

                const url = URL.createObjectURL(blob);

                setFiles(prev => prev.map(f => {
                    if (f.id === file.id) {
                        return {
                            ...f,
                            status: 'complete',
                            progress: 100,
                            resultUrl: url
                        };
                    }
                    return f;
                }));

                toast.success(`Converted ${file.file.name}`);

            } catch (err: any) {
                console.error(err);
                setFiles(prev => prev.map(f =>
                    f.id === file.id ? { ...f, status: 'error', error: err.message || "Conversion failed" } : f
                ));
                toast.error(`Failed to convert ${file.file.name}`);
            }
        }
    };

    const updateFileStatus = (id: string, status: PdfToWordStatus, progress: number) => {
        setFiles(prev => prev.map(f =>
            f.id === id ? { ...f, status, progress } : f
        ));
    };

    const removeFile = (id: string) => {
        setFiles(prev => {
            const file = prev.find(f => f.id === id);
            if (file?.resultUrl) URL.revokeObjectURL(file.resultUrl);
            return prev.filter(f => f.id !== id);
        });
    };

    // --- Helpers for UI ---
    const getStatusColor = (status: PdfToWordStatus) => {
        switch (status) {
            case 'analyzing': return 'text-blue-500';
            case 'converting': return 'text-yellow-600';
            case 'complete': return 'text-green-600';
            case 'error': return 'text-red-500';
            default: return 'text-muted-foreground';
        }
    };

    const getStatusIcon = (status: PdfToWordStatus) => {
        switch (status) {
            case 'analyzing': return 'loader';
            case 'converting': return 'loader-2';
            case 'complete': return 'check-circle';
            case 'error': return 'alert-circle';
            default: return 'file';
        }
    };

    // --- Empty State ---
    if (files.length === 0) {
        return (
            <div className="mt-6 w-full max-w-7xl mx-auto">
                <div className="bg-card rounded-2xl shadow-xl shadow-primary/5 border border-border/50 p-2 md:p-4">
                    <PdfUploader
                        onUpload={handleUpload}
                        maxFiles={5}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4">
            <div className="rounded-2xl border border-border bg-surface shadow-xl shadow-primary/5 p-4 md:p-8 backdrop-blur-sm w-full max-w-7xl max-h-[90vh] overflow-y-auto">
                <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

                    {/* Left Column: File List (8/12) */}
                    <div className="lg:col-span-8 flex flex-col gap-6">
                        {/* Toolbar */}
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <div className="p-2 bg-red-100 rounded-lg text-red-600 shrink-0">
                                    <Icon name="files" size={20} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg leading-tight">{files.length} Document{files.length !== 1 && 's'}</h3>
                                    <p className="text-xs text-muted-foreground">Ready to convert</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <Button variant="secondary" onClick={() => setFiles([])} className="gap-2 text-muted-foreground hover:text-red-500">
                                    <Icon name="trash-2" size={16} /> Clear All
                                </Button>
                            </div>
                        </div>

                        {/* File List */}
                        <div className="space-y-3">
                            {files.map((item) => (
                                <div key={item.id} className="bg-card border border-border rounded-xl p-4 shadow-sm flex items-center gap-4">
                                    {/* Icon / Preview Placeholder */}
                                    <div className="h-12 w-12 shrink-0 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                                        <Icon name={getStatusIcon(item.status)} size={24} className={item.status === 'analyzing' || item.status === 'converting' ? 'animate-spin' : ''} />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium truncate text-foreground">{item.file.name}</p>
                                            {item.isScanned && (
                                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-yellow-100 text-yellow-700 uppercase tracking-wide">
                                                    Scanned (OCR)
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 text-sm mt-1">
                                            <span className={`${getStatusColor(item.status)} flex items-center gap-1.5`}>
                                                {item.status === 'idle' && 'Ready'}
                                                {item.status === 'analyzing' && 'Analyzing...'}
                                                {item.status === 'converting' && `Converting... ${item.progress}%`}
                                                {item.status === 'complete' && 'Converted'}
                                                {item.status === 'error' && 'Error'}
                                            </span>
                                            <span className="text-muted-foreground">•</span>
                                            <span className="text-muted-foreground">{(item.file.size / 1024 / 1024).toFixed(2)} MB</span>
                                            {item.pageCount > 0 && (
                                                <>
                                                    <span className="text-muted-foreground">•</span>
                                                    <span className="text-muted-foreground">{item.pageCount} Pages</span>
                                                </>
                                            )}
                                        </div>

                                        {/* Progress Bar */}
                                        {(item.status === 'converting' || item.status === 'analyzing') && (
                                            <div className="mt-2 h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary transition-all duration-300"
                                                    style={{ width: `${Math.max(5, item.progress)}%` }}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2">
                                        {item.status === 'complete' && item.resultUrl && (
                                            <a href={item.resultUrl} download={`${item.file.name.replace('.pdf', '')}.docx`}>
                                                <Button className="gap-2 bg-green-600 hover:bg-green-700 text-white border-transparent px-3 py-1.5 text-sm h-auto">
                                                    <Icon name="download" size={16} /> <span className="hidden sm:inline">Download</span>
                                                </Button>
                                            </a>
                                        )}
                                        <button
                                            onClick={() => removeFile(item.id)}
                                            className="p-2 text-muted-foreground hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors"
                                        >
                                            <Icon name="x" size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Settings (4/12) */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                        <div className="bg-card border border-border rounded-xl shadow-sm p-6 space-y-6 sticky top-6">
                            <div>
                                <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
                                    <Icon name="settings" size={18} className="text-primary" />
                                    Conversion Settings
                                </h3>

                                <div className="space-y-6">
                                    {/* OCR Toggle */}
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="space-y-0.5">
                                            <label className="text-sm font-medium text-foreground">OCR Mode</label>
                                            <p className="text-xs text-muted-foreground">Force text recognition for scanned images</p>
                                        </div>
                                        <button
                                            onClick={() => setUseOcr(!useOcr)}
                                            type="button"
                                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${useOcr ? 'bg-primary' : 'bg-input'}`}
                                        >
                                            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow-lg ring-0 transition duration-200 ease-in-out ${useOcr ? 'translate-x-5' : 'translate-x-0'}`} />
                                        </button>
                                    </div>

                                    {/* Output Format */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground block">Output Format</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                onClick={() => setOutputFormat('docx')}
                                                className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${outputFormat === 'docx'
                                                    ? "bg-primary/10 text-primary border-primary"
                                                    : "bg-surface border-border hover:border-primary/50"
                                                    }`}
                                            >
                                                DOCX (Word)
                                            </button>
                                            <button
                                                onClick={() => setOutputFormat('txt')}
                                                disabled
                                                className="px-3 py-2 rounded-lg text-sm font-medium border border-border bg-secondary/50 text-muted-foreground cursor-not-allowed opacity-70"
                                            >
                                                TXT (Coming Soon)
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-border">
                                <Button
                                    className="w-full h-12 text-lg font-semibold shadow-lg shadow-primary/20"
                                    onClick={handleConvert}
                                    disabled={files.some(f => f.status === 'converting' || f.status === 'analyzing') || files.every(f => f.status === 'complete')}
                                >
                                    {files.some(f => f.status === 'converting') ? (
                                        <>
                                            <Icon name="loader" size={20} className="animate-spin mr-2" />
                                            Converting...
                                        </>
                                    ) : (
                                        <>
                                            Convert All Files
                                            <Icon name="arrow-right" size={20} className="ml-2" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            );
}
