"use client";

import { useState, useTransition } from "react";
import { ImageUploader } from "@/components/tools/ImageUploader";
import { Button } from "@/components/ui/Button";
import { convertImageAction } from "@/actions/tools";
import { toast } from "sonner";
import { Icon } from "@/components/ui/Icon";
import JSZip from "jszip";

type ConversionResult = {
    id: string;
    file: File;
    url: string;
    originalSize: number;
    newSize: number;
    targetFormat: string;
};

type TargetFormat = "jpeg" | "png" | "webp" | "gif" | "tiff" | "avif";

export default function ConvertPage() {
    const [files, setFiles] = useState<File[]>([]);
    const [targetFormat, setTargetFormat] = useState<TargetFormat>("jpeg");
    const [isPending, startTransition] = useTransition();
    const [results, setResults] = useState<ConversionResult[]>([]);
    const [completedCount, setCompletedCount] = useState(0);

    const handleUpload = (uploadedFiles: File[]) => {
        // Filter out unsupported inputs if necessary, though we handle most via backend error
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

    const handleConvert = () => {
        if (files.length === 0) return;

        setCompletedCount(0);
        setResults([]);

        startTransition(async () => {
            const newResults: ConversionResult[] = [];

            for (const file of files) {
                const formData = new FormData();
                formData.append("file", file);
                formData.append("format", targetFormat);

                try {
                    const res = await convertImageAction(formData);

                    if (res.success && res.data) {
                        newResults.push({
                            id: res.data,
                            file: file,
                            url: res.data,
                            originalSize: res.originalSize,
                            newSize: res.newSize,
                            targetFormat: targetFormat
                        });
                    } else {
                        toast.error(`Failed to convert ${file.name}: ${res.error}`);
                    }
                } catch (e) {
                    console.error(e);
                    toast.error(`Error processing ${file.name}`);
                }
                setCompletedCount(prev => prev + 1);
            }

            setResults(newResults);
            if (newResults.length > 0) {
                toast.success(`Converted ${newResults.length} images successfully!`);
            }
        });
    };

    const handleDownloadAll = async () => {
        if (results.length === 0) return;

        const zip = new JSZip();

        for (const result of results) {
            const response = await fetch(result.url);
            const blob = await response.blob();

            // Ensure extension matches target format
            let extension = result.targetFormat;
            if (extension === "jpeg") extension = "jpg";

            const fileName = `converted_${result.file.name.split('.')[0]}.${extension}`;
            zip.file(fileName, blob);
        }

        const content = await zip.generateAsync({ type: "blob" });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = "converted_images.zip";
        link.click();
    };

    return (
        <main className="mx-auto max-w-[900px] pb-24 pt-0">
            {/* Header */}
            <div className="mb-6 text-center">
                <h1 className="mb-2 text-3xl font-bold bg-gradient-to-br from-primary to-[#8e1c90] bg-clip-text text-transparent">
                    Image Converter
                </h1>
                <p className="text-sm text-muted">
                    Convert images to JPG, PNG, WebP, AVIF and more.
                </p>
            </div>

            {files.length === 0 ? (
                <div className="mx-auto max-w-3xl">
                    <ImageUploader onUpload={handleUpload} />
                </div>
            ) : (
                <div className="flex flex-col gap-8">
                    <div className="grid gap-6 md:grid-cols-[1fr,300px]">
                        <div className="space-y-6">
                            {/* Results List */}
                            {results.length > 0 ? (
                                <div className="space-y-4">
                                    {results.map((result, idx) => (
                                        <div key={idx} className="flex items-center justify-between rounded-xl border border-border bg-surface p-4">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 overflow-hidden rounded-md border border-border bg-background">
                                                    <img src={result.url} className="h-full w-full object-cover" alt="Result" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold truncate max-w-[200px]">{result.file.name}</p>
                                                    <p className="text-xs text-muted">
                                                        {formatSize(result.originalSize)} → <span className="font-medium text-foreground">{formatSize(result.newSize)}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <a href={result.url} download={`converted_${result.file.name.split('.')[0]}.${result.targetFormat === 'jpeg' ? 'jpg' : result.targetFormat}`}>
                                                <Button variant="ghost" size="icon">
                                                    <Icon name="download" size={20} />
                                                </Button>
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                // Pending / Selected Files
                                <div className="rounded-xl border border-border bg-surface p-6">
                                    <h3 className="mb-4 font-semibold">Selected Files ({files.length})</h3>
                                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                                        {files.map((f, i) => (
                                            <div key={i} className="relative aspect-square overflow-hidden rounded-md border border-border group">
                                                <img
                                                    src={URL.createObjectURL(f)}
                                                    alt={f.name}
                                                    className="h-full w-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium">
                                                    {f.type.split('/')[1].toUpperCase()}
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

                        {/* Sidebar */}
                        <div className="space-y-6">
                            <div className="rounded-xl border border-border bg-surface p-6">
                                <h3 className="mb-4 font-semibold flex items-center gap-2">
                                    <Icon name="settings" size={18} />
                                    Convert To
                                </h3>

                                <div className="space-y-6">
                                    <div>
                                        <select
                                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                            value={targetFormat}
                                            onChange={(e) => setTargetFormat(e.target.value as TargetFormat)}
                                        >
                                            <option value="jpeg">JPEG / JPG</option>
                                            <option value="png">PNG</option>
                                            <option value="webp">WebP</option>
                                            <option value="avif">AVIF</option>
                                            <option value="tiff">TIFF</option>
                                            <option value="gif">GIF</option>
                                        </select>
                                    </div>

                                    <div className="text-xs text-muted">
                                        {targetFormat === 'jpeg' && "Best for photos, smaller size."}
                                        {targetFormat === 'png' && "Best for graphics, transparent backgrounds."}
                                        {targetFormat === 'webp' && "Modern format, great balance of size/quality."}
                                        {targetFormat === 'avif' && "Next-gen format, superior compression."}
                                        {targetFormat === 'tiff' && "High quality, large file size."}
                                        {targetFormat === 'gif' && "For animations."}
                                    </div>

                                    {results.length === 0 ? (
                                        <Button
                                            variant="primary"
                                            onClick={handleConvert}
                                            disabled={isPending}
                                            className="w-full py-4"
                                        >
                                            {isPending ? (
                                                <span className="flex items-center gap-2">
                                                    <Icon name="rotate-cw" size={20} className="animate-spin" />
                                                    Converting...
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-2">
                                                    Convert Images
                                                    <Icon name="convert" size={20} />
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
                                                Download ZIP
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                onClick={() => {
                                                    setFiles([]);
                                                    setResults([]);
                                                }}
                                                className="w-full"
                                            >
                                                Convert More
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* SEO Content */}
            <div className="mt-12 mb-16 border-t border-border pt-8">
                <section>
                    <h2 className="mb-6 text-2xl font-bold text-foreground">
                        Why Convert Images?
                    </h2>
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                        <div>
                            <h3 className="mb-2 text-lg font-semibold">🌐 Web Compatibility</h3>
                            <p className="text-sm leading-relaxed text-muted">
                                Convert newer formats like HEIC or TIFF to universally supported JPEG or PNG for websites.
                            </p>
                        </div>
                        <div>
                            <h3 className="mb-2 text-lg font-semibold">⚡ Performance</h3>
                            <p className="text-sm leading-relaxed text-muted">
                                Switch to modern formats like WebP or AVIF to significantly reduce file size without quality loss.
                            </p>
                        </div>
                        <div>
                            <h3 className="mb-2 text-lg font-semibold">🎨 Transparency</h3>
                            <p className="text-sm leading-relaxed text-muted">
                                Need a clear background? Convert standard JPEGs to PNG or WebP to support transparency.
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}
