"use client";

import { useState, useTransition } from "react";
import { ImageUploader } from "@/components/tools/ImageUploader";
import { QualitySlider } from "@/components/tools/QualitySlider";
import { Button } from "@/components/ui/Button";
import { compressImageAction } from "@/actions/tools";
import { toast } from "sonner";
import { Icon } from "@/components/ui/Icon";
import JSZip from "jszip";
import { ImageComparison } from "@/components/tools/ImageComparison";

type CompressionResult = {
    id: string; // url as id
    file: File;
    url: string;
    originalSize: number;
    newSize: number;
    error?: string;
};

type TargetFormat = "original" | "jpeg" | "png" | "webp" | "gif" | "tiff" | "avif";

export default function CompressPage() {
    const [files, setFiles] = useState<File[]>([]);
    const [quality, setQuality] = useState(80);
    const [targetFormat, setTargetFormat] = useState<TargetFormat>("original");
    const [isPending, startTransition] = useTransition();
    const [results, setResults] = useState<CompressionResult[]>([]);
    const [completedCount, setCompletedCount] = useState(0);

    const handleUpload = (uploadedFiles: File[]) => {
        // Filter out HEIC if not supported strictly (though we advise against it)
        const validFiles = uploadedFiles.filter(f =>
            !(f.name.toLowerCase().endsWith(".heic") || f.type.includes("heic") || f.type.includes("heif"))
        );

        if (validFiles.length < uploadedFiles.length) {
            toast.error("Some files were skipped (HEIC not supported).");
        }

        setFiles(validFiles);
        setResults([]);
        setCompletedCount(0);
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const handleCompress = () => {
        if (files.length === 0) return;

        setCompletedCount(0);
        setResults([]);

        startTransition(async () => {
            const newResults: CompressionResult[] = [];

            // Process sequentially to avoid overwhelming server or hitting limits
            for (const file of files) {
                const formData = new FormData();
                formData.append("file", file);
                formData.append("quality", quality.toString());
                if (targetFormat !== "original") {
                    formData.append("format", targetFormat);
                }

                try {
                    const res = await compressImageAction(formData);

                    if (res.success && res.data) {
                        newResults.push({
                            id: res.data,
                            file: file,
                            url: res.data,
                            originalSize: res.originalSize,
                            newSize: res.newSize
                        });
                    } else {
                        toast.error(`Failed to compress ${file.name}: ${res.error}`);
                    }
                } catch (e) {
                    console.error(e);
                    toast.error(`Error processing ${file.name}`);
                }
                setCompletedCount(prev => prev + 1);
            }

            setResults(newResults);
            if (newResults.length > 0) {
                toast.success(`Compressed ${newResults.length} images successfully!`);
            }
        });
    };

    const handleDownloadAll = async () => {
        if (results.length === 0) return;

        const zip = new JSZip();

        for (const result of results) {
            // Convert base64 to blob
            const response = await fetch(result.url);
            const blob = await response.blob();

            // Determine extension
            let extension = result.file.name.split('.').pop() || "jpg";
            if (targetFormat !== "original") {
                extension = targetFormat;
                // Simple mapping specifically for jpeg
                if (extension === "jpeg") extension = "jpg";
            } else {
                // If original format was kept, try to sniff it from blob type or keep original name
                // Usually sharp returns standard mime types.
                const type = blob.type.split('/')[1];
                if (type) extension = type === "jpeg" ? "jpg" : type;
            }

            const fileName = `compressed_${result.file.name.split('.')[0]}.${extension}`;
            zip.file(fileName, blob);
        }

        const content = await zip.generateAsync({ type: "blob" });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = "compressed_images.zip";
        link.click();
    };

    return (
        <main className="mx-auto max-w-[900px] pb-24 pt-0">
            {/* Header */}
            <div className="mb-6 text-center">
                <h1 className="mb-2 text-3xl font-bold bg-gradient-to-br from-primary to-[#8e1c90] bg-clip-text text-transparent">
                    Compress Images
                </h1>
                <p className="text-sm text-muted">
                    Reduce file size while maintaining quality.
                </p>
            </div>

            {files.length === 0 ? (
                <div className="mx-auto max-w-3xl">
                    <ImageUploader onUpload={handleUpload} />
                </div>
            ) : (
                <div className="flex flex-col gap-8">
                    {/* Controls & Queue */}
                    <div className="grid gap-6 md:grid-cols-[1fr,300px]">
                        <div className="space-y-6">
                            {/* File List / Results */}
                            {results.length > 0 ? (
                                <div className="space-y-6">
                                    {results.map((result, idx) => (
                                        <div key={idx} className="overflow-hidden rounded-xl border border-border bg-surface p-4">
                                            <div className="mb-4 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold">{result.file.name}</span>
                                                    <span className="text-xs text-muted">
                                                        ({formatSize(result.originalSize)} → <span className="text-success">{formatSize(result.newSize)}</span>)
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="rounded-full bg-success/10 px-2 py-1 text-xs font-bold text-success">
                                                        -{Math.round(((result.originalSize - result.newSize) / result.originalSize) * 100)}%
                                                    </span>
                                                    <a href={result.url} download={`compressed_${result.file.name}`}>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <Icon name="download" size={16} />
                                                        </Button>
                                                    </a>
                                                </div>
                                            </div>

                                            {/* Comparison View */}
                                            <div className="relative aspect-video max-h-[300px] w-full mx-auto">
                                                <ImageComparison
                                                    beforeImage={URL.createObjectURL(result.file)}
                                                    afterImage={result.url}
                                                    className="h-full"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                // Pending Files List
                                <div className="rounded-xl border border-border bg-surface p-6">
                                    <h3 className="mb-4 font-semibold">Selected Files ({files.length})</h3>
                                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                                        {files.map((f, i) => (
                                            <div key={i} className="relative aspect-square overflow-hidden rounded-md border border-border">
                                                <img
                                                    src={URL.createObjectURL(f)}
                                                    alt={f.name}
                                                    className="h-full w-full object-cover"
                                                />
                                                <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1 text-xs text-white truncate text-center">
                                                    {formatSize(f.size)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-6 text-center">
                                        <Button
                                            variant="secondary"
                                            onClick={() => {
                                                setFiles([]);
                                                setResults([]);
                                            }}
                                        >
                                            Clear Selection
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar Controls */}
                        <div className="space-y-6">
                            <div className="rounded-xl border border-border bg-surface p-6">
                                <h3 className="mb-4 font-semibold flex items-center gap-2">
                                    <Icon name="settings" size={18} />
                                    Settings
                                </h3>

                                <div className="space-y-6">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium">Quality</label>
                                        <QualitySlider quality={quality} onChange={setQuality} />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium">Format</label>
                                        <select
                                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                            value={targetFormat}
                                            onChange={(e) => setTargetFormat(e.target.value as TargetFormat)}
                                        >
                                            <option value="original">Keep Original</option>
                                            <option value="jpeg">JPEG (Good for Photos)</option>
                                            <option value="png">PNG (Lossless)</option>
                                            <option value="webp">WebP (Modern)</option>
                                            <option value="avif">AVIF (Best Compression)</option>
                                        </select>
                                    </div>

                                    {results.length === 0 ? (
                                        <Button
                                            variant="primary"
                                            onClick={handleCompress}
                                            disabled={isPending}
                                            className="w-full py-6 text-lg"
                                        >
                                            {isPending ? (
                                                <span className="flex items-center gap-2">
                                                    <Icon name="rotate-cw" size={20} className="animate-spin" />
                                                    Processing {completedCount}/{files.length}
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-2">
                                                    Compress All
                                                    <Icon name="compress" size={20} />
                                                </span>
                                            )}
                                        </Button>
                                    ) : (
                                        <div className="space-y-3">
                                            <Button
                                                variant="primary"
                                                onClick={handleDownloadAll}
                                                className="w-full bg-success hover:bg-success/90"
                                            >
                                                <Icon name="download" size={18} className="mr-2" />
                                                Download All (.zip)
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                onClick={() => {
                                                    setFiles([]);
                                                    setResults([]);
                                                }}
                                                className="w-full"
                                            >
                                                Start Over
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Content Section */}
            <div className="mt-12 mb-16 border-t border-border pt-8">
                <section className="mb-16">
                    <h2 className="mb-6 text-2xl font-bold text-foreground">
                        Batch Compression
                    </h2>
                    <div className="grid gap-6">
                        {[
                            "Upload unlimited images at once.",
                            "Choose a target format or keep original.",
                            "Download individually or as a ZIP archive.",
                            "Compare before and after visually."
                        ].map((step, i) => (
                            <div key={i} className="flex items-start gap-4">
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-white">
                                    {i + 1}
                                </span>
                                <span className="text-base leading-relaxed text-muted">
                                    {step}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}
