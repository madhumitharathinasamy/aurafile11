"use client";

import React, { useState, useCallback, useEffect } from "react";
import { ImageUploader } from "@/components/tools/ImageUploader";
import { toast } from "sonner";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";

// Define supported extensions for logic and display
const ACCEPTED_EXTENSIONS = {
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "image/webp": [".webp"],
    "image/gif": [".gif"],
    "image/tiff": [".tiff", ".tif"],
    "image/avif": [".avif"],
    "image/bmp": [".bmp"],
    "image/heic": [".heic"],
    "image/heif": [".heif"],
    "image/x-icon": [".ico"],
};

// Check if file type is supported for processing
const isSupportedInput = (file: File) => {
    // Check against mime types we accept
    return Object.keys(ACCEPTED_EXTENSIONS).some(mime => {
        // Simple mime check or extension check
        if (file.type === mime) return true;
        // Fallback extension check
        const ext = `.${file.name.split('.').pop()?.toLowerCase()}`;
        return ACCEPTED_EXTENSIONS[mime as keyof typeof ACCEPTED_EXTENSIONS].includes(ext);
    });
};

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

// Validation helper
const validateFile = (file: File): string | null => {
    // 1. Check Format
    const isSupported = Object.keys(ACCEPTED_EXTENSIONS).some(mime => {
        if (file.type === mime) return true;
        const ext = `.${file.name.split('.').pop()?.toLowerCase()}`;
        return ACCEPTED_EXTENSIONS[mime as keyof typeof ACCEPTED_EXTENSIONS]?.includes(ext);
    });

    if (!isSupported) return "Format not supported";

    // 2. Check Size
    if (file.size > MAX_FILE_SIZE) return "File too large (>50MB)";

    // 3. Basic Corruption Check (Zero byte)
    if (file.size === 0) return "File is empty/corrupted";

    return null;
};

// Helper to format file size
const formatSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

export default function ConvertTool() {
    type UploadedFile = {
        id: string;
        file: File;
    };

    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [convertedFiles, setConvertedFiles] = useState<{ [key: string]: string }>({}); // Map ID -> objectUrl

    // Settings State
    const [targetFormat, setTargetFormat] = useState<string>("jpg");
    const [quality, setQuality] = useState<number>(100);
    const [backgroundColor, setBackgroundColor] = useState<string>("#ffffff");
    const [stripMetadata, setStripMetadata] = useState<boolean>(true);
    const [isConverting, setIsConverting] = useState<boolean>(false);

    // Reset conversion results when settings change
    useEffect(() => {
        if (Object.keys(convertedFiles).length > 0) {
            Object.values(convertedFiles).forEach(url => URL.revokeObjectURL(url));
            setConvertedFiles({});
        }
    }, [targetFormat, quality, backgroundColor, stripMetadata]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            setConvertedFiles(prev => {
                Object.values(prev).forEach(url => URL.revokeObjectURL(url));
                return {};
            });
        };
    }, []);

    const handleUpload = useCallback((newFiles: File[]) => {
        // 1. Filter exact duplicates (same name AND size) to avoid redundancy
        // But allow same name with different size
        const uniqueFiles = newFiles.filter(newFile =>
            !files.some(existing => existing.file.name === newFile.name && existing.file.size === newFile.size)
        );

        // 2. Enforce 20 file limit
        const MAX_FILES = 20;
        const remainingSlots = MAX_FILES - files.length;

        if (remainingSlots <= 0) {
            toast.error("Maximum 20 files limit reached.");
            return;
        }

        const filesToAdd = uniqueFiles.slice(0, remainingSlots).map(file => ({
            id: crypto.randomUUID(),
            file
        }));

        const skippedCount = uniqueFiles.length - filesToAdd.length;

        if (filesToAdd.length > 0) {
            setFiles(prev => [...prev, ...filesToAdd]);

            // Success Message
            if (skippedCount > 0) {
                toast.warning(`Added ${filesToAdd.length} files. Skipped ${skippedCount} (Limit 20).`);
            } else {
                toast.success(`Added ${filesToAdd.length} image${filesToAdd.length > 1 ? 's' : ''}`);
            }
        }

        // Handling duplicates message if we didn't hit the limit just now
        if (remainingSlots > 0 && uniqueFiles.length < newFiles.length && skippedCount === 0) {
            toast.info("Duplicate files were skipped.");
        }
    }, [files]);

    const handleRemove = useCallback((idToRemove: string) => {
        setFiles(prev => {
            const newFiles = prev.filter(f => f.id !== idToRemove);
            if (newFiles.length === 0) {
                // Cleanup all if empty
                setConvertedFiles(prevConverted => {
                    Object.values(prevConverted).forEach(url => URL.revokeObjectURL(url));
                    return {};
                });
            } else {
                // Cleanup specific file
                setConvertedFiles(prevConverted => {
                    const newConverted = { ...prevConverted };
                    if (newConverted[idToRemove]) {
                        URL.revokeObjectURL(newConverted[idToRemove]);
                        delete newConverted[idToRemove];
                    }
                    return newConverted;
                });
            }
            return newFiles;
        });
    }, []);

    const handleConvert = async () => {
        if (files.length === 0) return;

        setIsConverting(true);
        // Clean up previous URLs
        Object.values(convertedFiles).forEach(url => URL.revokeObjectURL(url));
        setConvertedFiles({});
        toast.info(`Starting conversion of ${files.length} files...`);

        try {
            // Import the server action dynamically
            const { convertImageAction } = await import("@/actions/tools");

            let successCount = 0;
            let errorCount = 0;

            // Sequential processing to avoid memory spikes and server overload
            for (const { id, file } of files) {
                // Skip invalid files
                if (validateFile(file)) {
                    errorCount++;
                    continue;
                }

                try {
                    const formData = new FormData();
                    formData.append("file", file);
                    formData.append("format", targetFormat);
                    formData.append("quality", quality.toString());

                    const result = await convertImageAction(formData);

                    if (result.success && result.data) {
                        // Convert Base64 to Blob -> ObjectURL for better memory management
                        const response = await fetch(result.data);
                        const blob = await response.blob();
                        const objectUrl = URL.createObjectURL(blob);

                        setConvertedFiles(prev => ({
                            ...prev,
                            [id]: objectUrl
                        }));
                        successCount++;
                    } else {
                        console.error(`Failed to convert ${file.name}:`, result.error);
                        errorCount++;
                    }
                } catch (err) {
                    console.error(`Error converting ${file.name}:`, err);
                    errorCount++;
                }
            }

            if (successCount === 0) {
                toast.error("Failed to convert files. Please try again.");
            } else if (errorCount > 0) {
                toast.warning(`Converted ${successCount} files. ${errorCount} failed.`);
            } else {
                toast.success(`Successfully converted ${successCount} files!`);
            }

        } catch (error) {
            console.error("Conversion error:", error);
            toast.error("An error occurred during conversion.");
        } finally {
            setIsConverting(false);
        }
    };

    const downloadFile = (fileName: string, fileUrl: string) => {
        const link = document.createElement("a");
        link.href = fileUrl;
        const originalName = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
        const validExt = targetFormat === "jpeg" ? "jpg" : targetFormat; // Normalize ext
        link.download = `${originalName}.${validExt}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const downloadAll = async () => {
        try {
            const JSZip = (await import("jszip")).default;
            const zip = new JSZip();
            const usedNames = new Set<string>();

            // Iterate state files to maintain order and match IDs
            const promises = files.map(async ({ id, file }) => {
                const fileUrl = convertedFiles[id];
                if (!fileUrl) return; // Skip if not converted

                const originalName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
                const validExt = targetFormat === "jpeg" ? "jpg" : targetFormat;

                // Handle duplicate filenames
                let fileName = `${originalName}.${validExt}`;
                let counter = 1;
                while (usedNames.has(fileName)) {
                    fileName = `${originalName} (${counter}).${validExt}`;
                    counter++;
                }
                usedNames.add(fileName);

                // Fetch blob from Object URL
                const response = await fetch(fileUrl);
                if (!response.ok) throw new Error(`Failed to fetch ${fileName}`);
                const blob = await response.blob();

                zip.file(fileName, blob);
            });

            await Promise.all(promises);

            const content = await zip.generateAsync({ type: "blob" });
            const url = URL.createObjectURL(content);
            const link = document.createElement("a");
            link.href = url;
            link.download = `converted_images_${new Date().getTime()}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Download error:", error);
            toast.error("Failed to download zip file. Please try again.");
        }
    };

    // If no files, show the large center uploader
    if (files.length === 0) {
        return (
            <div className="w-full max-w-3xl mx-auto py-12">
                <div className="bg-card rounded-2xl shadow-xl shadow-primary/5 border border-border/50 p-2 md:p-4">
                    <ImageUploader
                        onUpload={handleUpload}
                        multiple={true}
                        maxSize={50 * 1024 * 1024} // 50MB
                        maxFiles={20}
                        title="Drag & drop images here"
                        description="Supports JPG, PNG, WEBP, AVIF, GIF, TIFF, HEIC, BMP"
                        subDescription="(Max 20 files, 50MB per file)"
                        accept={ACCEPTED_EXTENSIONS}
                    />
                </div>
                <div className="mt-8 text-center text-muted-foreground text-sm">
                    <p>✨ No signup required • 100% Private • Browser-based</p>
                </div>
            </div>
        );
    }

    // List View
    return (
        <div className="w-full max-w-4xl mx-auto space-y-6">

            <div className="space-y-3">
                {files.map(({ id, file }) => {
                    const extension = file.name.slice((Math.max(0, file.name.lastIndexOf(".")) || Infinity) + 1).toUpperCase();
                    const error = validateFile(file);
                    const convertedData = convertedFiles[id];

                    return (
                        <div
                            key={id}
                            className={`flex items-center justify-between p-3 md:p-4 rounded-xl border bg-card shadow-sm transition-all ${error ? "border-red-500/50 bg-red-50/50" : "border-border hover:shadow-md"
                                }`}
                        >
                            {/* File Info */}
                            <div className="flex items-center gap-3 md:gap-4 overflow-hidden flex-1">
                                <div className={`h-10 w-10 shrink-0 rounded-lg flex items-center justify-center font-bold text-xs ${error ? "bg-red-100 text-red-600" : "bg-primary/10 text-primary"}`}>
                                    {extension || "IMG"}
                                </div>

                                <div className="min-w-0 flex flex-col">
                                    <p className={`font-medium text-sm truncate ${error ? "text-red-700" : "text-foreground"}`} title={file.name}>
                                        {file.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground flex gap-2">
                                        <span>{formatSize(file.size)}</span>
                                        <span>•</span>
                                        <span>{extension}</span>
                                    </p>
                                    {error && (
                                        <div className="flex items-center gap-1 mt-1 text-red-600">
                                            <Icon name="x" size={12} />
                                            <span className="text-xs font-medium">{error}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                                {convertedData ? (
                                    <Button
                                        variant="primary"
                                        className="h-8 px-3 text-xs gap-1.5 shadow-sm"
                                        onClick={() => downloadFile(file.name, convertedData)}
                                    >
                                        <Icon name="download" size={14} />
                                        <span className="hidden sm:inline">Download</span>
                                    </Button>
                                ) : (
                                    <button
                                        onClick={() => handleRemove(id)}
                                        className="p-2 rounded-full hover:bg-red-100 text-red-500 transition-colors group shrink-0"
                                        title="Remove file"
                                    >
                                        <Icon name="x" size={20} />
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-4 mt-8 w-full">
                <div className="relative w-full md:w-auto">
                    {/* Trick to use ImageUploader as a button trigger */}
                    <div className="absolute inset-0 opacity-0 cursor-pointer overflow-hidden z-20">
                        <ImageUploader
                            onUpload={handleUpload}
                            multiple={true}
                            maxSize={50 * 1024 * 1024}
                            maxFiles={20 - files.length} // Dynamic limit
                            accept={ACCEPTED_EXTENSIONS}
                        />
                    </div>
                    <Button variant="primary" className="gap-2 pointer-events-none text-xs md:text-sm w-full md:w-auto justify-center">
                        <Icon name="plus" size={16} />
                        Add More
                    </Button>
                </div>

                <Button
                    variant="secondary"
                    className="gap-2 text-xs md:text-sm w-full md:w-auto justify-center"
                    onClick={() => {
                        setFiles([]);
                        setConvertedFiles({});
                    }}
                >
                    <Icon name="minus" size={16} />
                    Remove All
                </Button>
            </div>

            {/* Conversion Settings Panel */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
                <div className="flex items-center gap-2 border-b border-border pb-4">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Icon name="settings" size={20} />
                    </div>
                    <h3 className="text-lg font-semibold">Conversion Settings</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Target Format */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-foreground">Target Format</label>
                        <select
                            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            value={targetFormat}
                            onChange={(e) => setTargetFormat(e.target.value)}
                        >
                            <option value="jpg">JPG - JPEG Image</option>
                            <option value="png">PNG - Portable Network Graphics</option>
                            <option value="webp">WebP - Modern Web Image</option>
                            <option value="avif">AVIF - AV1 Image File</option>
                            <option value="tiff">TIFF - Tagged Image File</option>
                            <option value="gif">GIF - Graphics Interchange Format</option>
                            <option value="bmp">BMP - Bitmap Image</option>
                            <option value="ico">ICO - Icon File</option>
                        </select>
                    </div>

                    {/* Quality Slider (Lossy formats only) */}
                    {(targetFormat === "jpg" || targetFormat === "webp" || targetFormat === "avif") && (
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <label className="text-sm font-medium text-foreground">Quality</label>
                                <span className="text-sm text-muted-foreground">{quality}%</span>
                            </div>
                            <input
                                type="range"
                                min="10"
                                max="100"
                                step="5"
                                value={quality}
                                onChange={(e) => setQuality(Number(e.target.value))}
                                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                        </div>
                    )}

                    {/* Background Color (JPG only) */}
                    {targetFormat === "jpg" && (
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-foreground">Background Color</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={backgroundColor}
                                    onChange={(e) => setBackgroundColor(e.target.value)}
                                    className="h-10 w-14 p-1 rounded-md border border-input cursor-pointer bg-background"
                                />
                                <span className="text-sm font-mono text-muted-foreground uppercase">{backgroundColor}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">JPG does not support transparency.</p>
                        </div>
                    )}

                    {/* Strip Metadata */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-foreground">Metadata</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="strip-metadata"
                                checked={stripMetadata}
                                onChange={(e) => setStripMetadata(e.target.checked)}
                                className="h-5 w-5 rounded border-input text-primary focus:ring-primary/20"
                            />
                            <label htmlFor="strip-metadata" className="text-sm text-foreground cursor-pointer">
                                Strip EXIF/Metadata (Recommended for privacy)
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Convert Button */}
            <div className="flex justify-end pt-4">
                {(() => {
                    const allConverted = files.length > 0 && files.every(f => convertedFiles[f.id]);

                    return (
                        <Button
                            variant="primary"
                            className="w-full md:w-auto min-w-[200px] gap-2 font-semibold text-lg shadow-lg shadow-primary/20"
                            onClick={() => {
                                if (allConverted) {
                                    if (files.length > 1) {
                                        downloadAll();
                                    } else {
                                        const fileState = files[0];
                                        if (fileState && convertedFiles[fileState.id]) {
                                            downloadFile(fileState.file.name, convertedFiles[fileState.id]);
                                        }
                                    }
                                } else {
                                    handleConvert();
                                }
                            }}
                            disabled={
                                !allConverted && (
                                    files.length === 0 ||
                                    files.every(f => validateFile(f.file) !== null) ||
                                    isConverting
                                )
                            }
                        >
                            {isConverting ? (
                                <>
                                    <Icon name="loader" size={20} className="animate-spin" />
                                    <span>Converting ({files.filter(f => !validateFile(f.file)).length} files)</span>
                                </>
                            ) : allConverted ? (
                                <>
                                    <Icon name="download" size={20} />
                                    <span>{files.length > 1 ? "Download All (ZIP)" : "Download Image"}</span>
                                </>
                            ) : (
                                <>
                                    <span>{files.length > 1 ? "Convert All Images" : "Convert Image"}</span>
                                    <Icon name="arrow-right" size={20} />
                                </>
                            )}
                        </Button>
                    );
                })()}
            </div>
        </div>
    );
}
