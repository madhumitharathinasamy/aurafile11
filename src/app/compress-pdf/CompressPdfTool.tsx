"use client";

import { useState, useTransition } from "react";
import { PdfUploader } from "@/components/tools/PdfUploader";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import { Icon } from "@/components/ui/Icon";
import { PDFDocument } from "pdf-lib";

export default function CompressPdfTool() {
    const [file, setFile] = useState<File | null>(null);
    const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
    const [originalSize, setOriginalSize] = useState(0);
    const [compressedSize, setCompressedSize] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleUpload = (files: File[]) => {
        if (files.length === 0) return;
        const selectedFile = files[0];
        setFile(selectedFile);
        setOriginalSize(selectedFile.size);
        setCompressedUrl(null);
    };

    const handleCompress = async () => {
        if (!file) return;
        setIsProcessing(true);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);

            // "Compression" in pdf-lib is limited to structure optimization
            // We can try to copy pages to a new document to discard unused objects
            const newPdf = await PDFDocument.create();
            const pages = await newPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
            pages.forEach((page) => newPdf.addPage(page));

            const pdfBytes = await newPdf.save({ useObjectStreams: false }); // Sometimes disabling streams helps compatibility, but enabling helps size. Default is true.
            // Let's try default save first, often repacking saves space from incrementally updated PDFs.
            // Actually, let's try just saving the original doc? No, creating new one is better for cleaning.
            // Re-saving with default options.

            // Checking if we actually saved space
            if (pdfBytes.byteLength >= file.size) {
                toast.info("This PDF is already optimized.", {
                    description: "We couldn't reduce the file size further without losing quality."
                });
                // For UX, treat it as "done" but with 0% savings
                const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
                const url = URL.createObjectURL(blob);
                setCompressedUrl(url);
                setCompressedSize(pdfBytes.byteLength);
            } else {
                const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
                const url = URL.createObjectURL(blob);
                setCompressedUrl(url);
                setCompressedSize(pdfBytes.byteLength);
                toast.success(`Compressed! Saved ${((file.size - pdfBytes.byteLength) / 1024).toFixed(2)} KB.`);
            }

        } catch (error) {
            console.error(error);
            toast.error("Failed to compress PDF. The file might be corrupted or password protected.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReset = () => {
        setFile(null);
        setCompressedUrl(null);
        setOriginalSize(0);
        setCompressedSize(0);
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    return (
        <div className="flex flex-col gap-8">
            {!file ? (
                <div className="mx-auto max-w-3xl">
                    <PdfUploader onUpload={handleUpload} />
                </div>
            ) : (
                <div className="mx-auto max-w-2xl w-full">
                    <div className="rounded-xl border border-border bg-surface p-8 text-center">
                        <div className="mb-6 flex justify-center">
                            <div className="rounded-full bg-red-100 p-4 text-red-600">
                                <Icon name="file-text" size={48} />
                            </div>
                        </div>

                        <h3 className="text-xl font-bold text-foreground mb-2">{file.name}</h3>
                        <p className="text-muted mb-8">Original Size: {formatSize(originalSize)}</p>

                        {compressedUrl ? (
                            <div className="space-y-6 animate-fade-in">
                                <div className="rounded-lg bg-green-50 p-4 text-green-800 border border-green-200">
                                    <div className="text-lg font-bold mb-1">Compression Complete!</div>
                                    <div className="flex justify-center gap-4 text-sm">
                                        <span>New Size: <strong>{formatSize(compressedSize)}</strong></span>
                                        <span>Savings: <strong>{Math.max(0, originalSize - compressedSize) > 0 ? (
                                            Math.round(((originalSize - compressedSize) / originalSize) * 100)
                                        ) : 0}%</strong></span>
                                    </div>
                                </div>

                                <div className="grid gap-3">
                                    <a href={compressedUrl} download={`compressed_${file.name}`} className="block w-full">
                                        <Button className="w-full py-6 text-lg bg-red-600 hover:bg-red-700 text-white shadow-red-500/20">
                                            <Icon name="download" size={20} className="mr-2" />
                                            Download PDF
                                        </Button>
                                    </a>
                                    <Button variant="secondary" onClick={handleReset} className="w-full">
                                        Compress Another PDF
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <Button
                                    onClick={handleCompress}
                                    disabled={isProcessing}
                                    className="w-full py-6 text-lg bg-red-600 hover:bg-red-700 text-white shadow-red-500/20"
                                >
                                    {isProcessing ? (
                                        <span className="flex items-center gap-2">
                                            <Icon name="rotate-cw" size={20} className="animate-spin" />
                                            Compressing PDF...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            Compress PDF
                                            <Icon name="file-minus" size={20} />
                                        </span>
                                    )}
                                </Button>
                                <Button variant="secondary" onClick={handleReset} className="w-full" disabled={isProcessing}>
                                    Cancel
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="mt-8 rounded-xl bg-red-50/50 p-4 text-sm text-red-600 border border-red-100 flex gap-3">
                        <Icon name="shield" size={20} className="flex-shrink-0 mt-0.5" />
                        <div>
                            <strong>Secure Processing:</strong> Your PDF is processed entirely in your web browser. It is never uploaded to any server.
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
