"use client";

import { useState, useTransition, useEffect } from "react";
import { ImageUploader } from "@/components/tools/ImageUploader";
import { QualitySlider } from "@/components/tools/QualitySlider";
import { Button } from "@/components/ui/Button";
import { compressImageAction } from "@/actions/tools";
import { toast } from "sonner";
import { Icon } from "@/components/ui/Icon";
import JSZip from "jszip";
import * as UTIF from "utif";
import { ImageComparison } from "@/components/tools/ImageComparison";

type CompressionResult = {
    id: string; // url as id
    file: File;
    url: string;
    originalSize: number;
    newSize: number;
    error?: string;
    originalPreview?: string;
    compressedPreview?: string;
};

type TargetFormat = "original" | "jpeg" | "png" | "webp" | "gif" | "tiff" | "avif";

export default function CompressTool() {
    const [files, setFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<Record<string, string>>({}); // Map file name -> data URL

    const isWebFriendlyImage = (file: File) => {
        // Check MIME type first
        if (["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif", "image/svg+xml", "image/bmp"].includes(file.type)) {
            return true;
        }
        // Check extension if MIME type failed or is generic (e.g. application/octet-stream)
        const ext = file.name.split('.').pop()?.toLowerCase();
        return ["jpg", "jpeg", "png", "webp", "gif", "avif", "svg", "bmp"].includes(ext || "");
    };

    const [quality, setQuality] = useState(80);
    const [targetFormat, setTargetFormat] = useState<TargetFormat>("original");
    const [isPending, startTransition] = useTransition();
    const [results, setResults] = useState<CompressionResult[]>([]);
    const [completedCount, setCompletedCount] = useState(0);
    const [lastCompressedSettings, setLastCompressedSettings] = useState<{ quality: number; format: TargetFormat } | null>(null);

    const [debouncedQuality, setDebouncedQuality] = useState(quality);

    // Debounce quality changes
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuality(quality);
        }, 300);
        return () => clearTimeout(timer);
    }, [quality]);

    // Generate client-side preview for TIFF/others using UTIF
    const generatePreview = async (file: File) => {
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (ext === 'tiff' || ext === 'tif' || file.type.includes('tiff')) {
            try {
                const arrayBuffer = await file.arrayBuffer();
                // UTIF imported at top level
                const ifds = UTIF.decode(arrayBuffer);
                if (ifds && ifds.length > 0) {
                    UTIF.decodeImage(arrayBuffer, ifds[0]);
                    const rgba = UTIF.toRGBA8(ifds[0]);
                    const width = ifds[0].width;
                    const height = ifds[0].height;

                    const canvas = document.createElement("canvas");
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext("2d");
                    if (ctx) {
                        const imageData = new ImageData(new Uint8ClampedArray(rgba), width, height);
                        ctx.putImageData(imageData, 0, 0);
                        const dataUrl = canvas.toDataURL("image/png");
                        setPreviews(prev => ({ ...prev, [file.name]: dataUrl }));
                    }
                }
            } catch (e) {
                console.error("Failed to generate TIFF preview", e);
            }
        }
    };

    const handleUpload = (uploadedFiles: File[]) => {
        const validFiles = uploadedFiles.filter(f =>
            !(f.name.toLowerCase().endsWith(".heic") || f.type.includes("heic") || f.type.includes("heif"))
        );

        if (validFiles.length < uploadedFiles.length) {
            toast.error("Some files were skipped (HEIC not supported).");
        }

        // Generate previews for new TIFF files
        validFiles.forEach(file => {
            generatePreview(file);
        });

        setFiles(validFiles);
        setResults([]);
        setCompletedCount(0);
    };

    const handleRemoveFile = (index: number) => {
        const fileToRemove = files[index];
        const newFiles = [...files];
        newFiles.splice(index, 1);
        setFiles(newFiles);

        // Cleanup preview
        if (fileToRemove) {
            setPreviews(prev => {
                const newPreviews = { ...prev };
                delete newPreviews[fileToRemove.name];
                return newPreviews;
            });
        }

        if (newFiles.length === 0) {
            setResults([]);
        }
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

        // Don't clear results immediately if updating single file to prevent flicker
        if (files.length > 1) {
            setCompletedCount(0);
            setResults([]);
        }

        startTransition(async () => {
            const newResults: CompressionResult[] = [];

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
                            id: res.data || "",
                            file: file,
                            url: res.data || "",
                            originalSize: res.originalSize || file.size,
                            newSize: res.newSize || file.size, // Fallback if undefined
                            originalPreview: res.originalPreview,
                            compressedPreview: res.compressedPreview
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
            setLastCompressedSettings({ quality, format: targetFormat });
            if (newResults.length > 0 && files.length > 1) {
                toast.success(`Compressed ${newResults.length} images successfully!`);
            }
        });
    };

    const handleDownloadAll = async () => {
        if (results.length === 0) return;

        // Single file download
        if (results.length === 1) {
            const result = results[0];
            const link = document.createElement('a');
            link.href = result.url;
            link.download = `compressed_${result.file.name}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            return;
        }

        // ZIP download
        const zip = new JSZip();

        for (const result of results) {
            const response = await fetch(result.url);
            const blob = await response.blob();

            let extension = result.file.name.split('.').pop() || "jpg";
            if (targetFormat !== "original") {
                extension = targetFormat;
                if (extension === "jpeg") extension = "jpg";
            } else {
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
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex flex-col gap-8">
            {files.length === 0 ? (
                <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-surface p-4 md:p-8 shadow-sm">
                    <div className="mb-6 text-center">
                        <h2 className="text-base font-semibold mb-2">Upload Images</h2>
                        <p className="text-xs text-muted-foreground">Select up to 10 images to compress</p>
                    </div>
                    <ImageUploader
                        onUpload={handleUpload}
                        multiple={true}
                        subDescription="Max 10 files · 25MB per file"
                    />
                </div>
            ) : (
                <div>
                    <div className="grid gap-2 md:gap-8 md:grid-cols-[1fr,320px] items-stretch">
                        {/* Results Column */}
                        <div className="space-y-6 min-w-0">
                            {results.length > 0 ? (
                                <div className="space-y-6 pb-10 md:pb-0">
                                    {/* Savings Summary */}
                                    <div className="rounded-xl bg-green-500/10 p-4 text-center border border-green-500/20">
                                        <p className="text-lg font-bold text-green-600">
                                            Saved {formatSize(results.reduce((acc, curr) => acc + (curr.originalSize - curr.newSize), 0))} <span className="text-sm font-normal text-green-600/80 ml-1">({Math.round((results.reduce((acc, curr) => acc + (curr.originalSize - curr.newSize), 0) / results.reduce((acc, curr) => acc + curr.originalSize, 0)) * 100)}%)</span>
                                        </p>
                                        <p className="text-xs text-green-600/70 mt-1">
                                            {formatSize(results.reduce((acc, curr) => acc + curr.originalSize, 0))} → {formatSize(results.reduce((acc, curr) => acc + curr.newSize, 0))}
                                        </p>
                                    </div>

                                    {results.map((result, idx) => (
                                        <div key={idx} className="overflow-hidden rounded-xl border border-border bg-surface p-3 sm:p-4 w-full shadow-sm">
                                            <div className="mb-4 flex items-center justify-between">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <span className="font-semibold truncate max-w-[120px] sm:max-w-[200px] text-sm sm:text-base" title={result.file.name}>{result.file.name}</span>
                                                    <span className="text-xs text-muted flex-shrink-0">
                                                        ({formatSize(result.newSize)})
                                                    </span>
                                                </div>
                                                <div className="flex-shrink-0">
                                                    <span className="rounded-full bg-success/10 px-2 py-1 text-xs font-bold text-success">
                                                        -{Math.round(((result.originalSize - result.newSize) / result.originalSize) * 100)}%
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="relative aspect-video max-h-[300px] w-full mx-auto group bg-muted/30 rounded-lg overflow-hidden">
                                                <ImageComparison
                                                    beforeImage={result.compressedPreview || result.url}
                                                    afterImage={result.originalPreview || previews[result.file.name] || URL.createObjectURL(result.file)}
                                                    beforeLabel="Compressed"
                                                    afterLabel="Original"
                                                    className="h-full"
                                                />

                                                {/* Individual Download Button */}
                                                <a
                                                    href={result.url}
                                                    download={`compressed_${result.file.name}`}
                                                    className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 z-30"
                                                >
                                                    <Button
                                                        className="h-8 sm:h-10 w-auto px-3 sm:px-6 gap-2 rounded-md shadow-xl bg-blue-600 hover:bg-green-600 text-white flex items-center justify-center overflow-hidden transition-all hover:scale-105 active:scale-95"
                                                        title="Download"
                                                    >
                                                        <Icon name="download" size={16} className="sm:w-5 sm:h-5 flex-shrink-0" />
                                                        <span className="hidden sm:inline text-sm font-medium whitespace-nowrap">Download</span>
                                                    </Button>
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-xl border border-border bg-surface p-6 h-full flex flex-col">
                                    <h3 className="mb-4 font-semibold">Selected Files ({files.length})</h3>
                                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                                        {files.map((f, i) => (
                                            <div key={i} className="relative aspect-square overflow-hidden rounded-md border border-border group bg-muted/30 flex items-center justify-center">
                                                {(f.type.includes('tiff') || f.name.toLowerCase().endsWith('.tiff') || f.name.toLowerCase().endsWith('.tif')) && (
                                                    <div className="absolute top-2 left-2 z-10 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm opacity-90 pointer-events-none">
                                                        TIFF
                                                    </div>
                                                )}
                                                {isWebFriendlyImage(f) || previews[f.name] ? (
                                                    <img
                                                        src={previews[f.name] || URL.createObjectURL(f)}
                                                        alt={f.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center text-muted-foreground p-4 text-center w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-muted/20 dark:to-muted/10">
                                                        <Icon name="file" size={32} className="mb-2 opacity-50" />
                                                        <span className="text-xs font-semibold truncate w-full max-w-[90%] block" title={f.name}>
                                                            {f.name}
                                                        </span>
                                                        <span className="text-[10px] text-muted-foreground/70 uppercase mt-1">
                                                            {f.name.split('.').pop()} File
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1 text-xs text-white truncate text-center backdrop-blur-sm">
                                                    {formatSize(f.size)}
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveFile(i)}
                                                    className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-red-500 transition-colors"
                                                    title="Remove"
                                                >
                                                    <Icon name="x" size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-auto pt-6 text-center">
                                        <Button
                                            variant="secondary"
                                            onClick={() => {
                                                setFiles([]);
                                                setResults([]);
                                            }}
                                            className="w-full h-auto py-2"
                                        >
                                            Clear All
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Settings Column */}
                        <div className="space-y-6">
                            <div className="md:sticky md:top-24">
                                <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
                                    <h3 className="mb-4 font-semibold flex items-center gap-2 text-sm uppercase tracking-wider text-muted-foreground">
                                        <Icon name="settings" size={16} />
                                        Settings
                                    </h3>

                                    <div className="space-y-5">
                                        <div className="grid grid-cols-1 gap-4">
                                            <div>
                                                <label className="mb-2 block text-xs font-medium text-muted-foreground">Quality</label>
                                                <QualitySlider quality={quality} onChange={setQuality} />
                                            </div>

                                            <div>
                                                <label className="mb-2 block text-xs font-medium text-muted-foreground">Format</label>
                                                <select
                                                    className="w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                                    value={targetFormat}
                                                    onChange={(e) => setTargetFormat(e.target.value as TargetFormat)}
                                                >
                                                    <option value="original">Original</option>
                                                    <option value="jpeg">JPEG</option>
                                                    <option value="png">PNG</option>
                                                    <option value="webp">WebP</option>
                                                    <option value="avif">AVIF</option>
                                                </select>
                                            </div>
                                        </div>

                                        {(results.length === 0 || (lastCompressedSettings && (quality !== lastCompressedSettings.quality || targetFormat !== lastCompressedSettings.format))) ? (
                                            <Button
                                                variant="primary"
                                                onClick={handleCompress}
                                                disabled={isPending}
                                                className="w-full py-6 text-lg font-bold shadow-lg shadow-primary/20"
                                            >
                                                {isPending ? (
                                                    <span className="flex items-center gap-2">
                                                        <Icon name="rotate-cw" size={20} className="animate-spin" />
                                                        Processing...
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-2">
                                                        Compress {files.length} {files.length === 1 ? 'Image' : 'Images'}
                                                        <Icon name="sparkles" size={20} />
                                                    </span>
                                                )}
                                            </Button>
                                        ) : (
                                            <div className="grid grid-cols-2 gap-3 md:grid-cols-1">
                                                <Button
                                                    onClick={handleDownloadAll}
                                                    className="w-full bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20 py-2 h-auto"
                                                >
                                                    <Icon name="download" size={18} className="mr-2" />
                                                    {results.length === 1 ? "Download" : `Download All (${results.length})`}
                                                </Button>
                                                <Button
                                                    variant="secondary"
                                                    onClick={() => {
                                                        setFiles([]);
                                                        setResults([]);
                                                    }}
                                                    className="w-full h-auto py-2"
                                                >
                                                    Clear All
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
