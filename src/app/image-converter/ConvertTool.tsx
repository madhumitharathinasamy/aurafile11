"use client";

import React, { useState, useEffect } from "react";
import { ImageUploader } from "@/components/tools/ImageUploader";
import { ToolModal } from "@/components/modal/ToolModal";
import { toast } from "sonner";
import { Icon } from "@/components/ui/Icon";
import { ImageComparison } from "@/components/tools/ImageComparison"; // Added ImageComparison import
import { useFileUpload } from "@/hooks/useFileUpload";

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

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const validateFile = (file: File): string | null => {
    const isSupported = Object.keys(ACCEPTED_EXTENSIONS).some(mime => {
        if (file.type === mime) return true;
        const ext = `.${file.name.split('.').pop()?.toLowerCase()} `;
        return ACCEPTED_EXTENSIONS[mime as keyof typeof ACCEPTED_EXTENSIONS]?.includes(ext);
    });
    if (!isSupported) return "Format not supported";
    if (file.size > MAX_FILE_SIZE) return "File too large (>50MB)";
    if (file.size === 0) return "File is empty/corrupted";
    return null;
};

export default function ConvertTool() {
    const {
        files,
        activeIndex,
        setActiveIndex,
        activeFile,
        addFiles,
        clearAll
    } = useFileUpload([]);

    // Settings State definition
    const [targetFormat, setTargetFormat] = useState<string>("jpg");
    const [quality, setQuality] = useState<number>(100);
    const [backgroundColor, setBackgroundColor] = useState<string>("#ffffff");
    const [stripMetadata, setStripMetadata] = useState<boolean>(true);

    const [isConverting, setIsConverting] = useState<boolean>(false);
    const [convertedFiles, setConvertedFiles] = useState<{ [key: string]: string }>({});

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

    const handleUpload = (newFiles: File[]) => {
        const uniqueFiles = newFiles.filter(newFile =>
            !files.some(existing => existing.file.name === newFile.name && existing.file.size === newFile.size)
        );

        const MAX_FILES = 20;
        const remainingSlots = MAX_FILES - files.length;

        if (remainingSlots <= 0) {
            toast.error("Maximum 20 files limit reached.");
            return;
        }

        const filesToAdd = uniqueFiles.slice(0, remainingSlots);
        const skippedCount = uniqueFiles.length - filesToAdd.length;

        if (filesToAdd.length > 0) {
            addFiles(filesToAdd);
            if (skippedCount > 0) {
                toast.warning(`Added ${filesToAdd.length} files.Skipped ${skippedCount} (Limit 20).`);
            }
        } else if (uniqueFiles.length < newFiles.length && skippedCount === 0) {
            toast.info("Duplicate files were skipped.");
        }
    };

    const handleConvert = async () => {
        if (files.length === 0) return;

        setIsConverting(true);
        // Clean up previous URLs
        Object.values(convertedFiles).forEach(url => URL.revokeObjectURL(url));
        setConvertedFiles({});
        toast.info(`Starting conversion of ${files.length} files...`);

        try {
            const { convertImageAction } = await import("@/actions/tools");
            let successCount = 0;
            let errorCount = 0;

            for (const integratedFile of files) {
                const file = integratedFile.file;
                const id = integratedFile.id;

                if (validateFile(file)) {
                    errorCount++;
                    continue;
                }

                try {
                    const formData = new FormData();
                    formData.append("file", file);
                    formData.append("format", targetFormat);
                    formData.append("quality", quality.toString());
                    if (targetFormat === 'jpg') {
                        formData.append("backgroundColor", backgroundColor);
                    }

                    const result = await convertImageAction(formData);

                    if (result.success && result.data) {
                        const response = await fetch(result.data);
                        const blob = await response.blob();
                        const objectUrl = URL.createObjectURL(blob);

                        setConvertedFiles(prev => ({
                            ...prev,
                            [id]: objectUrl
                        }));
                        successCount++;
                    } else {
                        console.error(`Failed to convert ${file.name}: `, result.error);
                        errorCount++;
                    }
                } catch (err) {
                    console.error(`Error converting ${file.name}: `, err);
                    errorCount++;
                }
            }

            if (successCount === 0) {
                toast.error("Failed to convert files. Please try again.");
            } else if (errorCount > 0) {
                toast.warning(`Converted ${successCount} files.${errorCount} failed.`);
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

    const downloadFile = async (fileName: string, fileUrl: string) => {
        try {
            // Mobile browsers often block direct data URL downloads as "insecure".
            // Fetching the data URL and creating a local ObjectURL Blob bypasses this.
            const response = await fetch(fileUrl);
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = blobUrl;
            const originalName = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
            const validExt = targetFormat === "jpeg" ? "jpg" : targetFormat;
            link.download = `${originalName}.${validExt} `;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error("Download failed:", error);
            toast.error("Failed to download image safely.");
        }
    };

    const downloadAll = async () => {
        try {
            const JSZip = (await import("jszip")).default;
            const zip = new JSZip();
            const usedNames = new Set<string>();

            const promises = files.map(async ({ id, file }) => {
                const fileUrl = convertedFiles[id];
                if (!fileUrl) return;

                const originalName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
                const validExt = targetFormat === "jpeg" ? "jpg" : targetFormat;

                let fileName = `${originalName}.${validExt} `;
                let counter = 1;
                while (usedNames.has(fileName)) {
                    fileName = `${originalName} (${counter}).${validExt} `;
                    counter++;
                }
                usedNames.add(fileName);

                const response = await fetch(fileUrl);
                if (!response.ok) throw new Error(`Failed to fetch ${fileName} `);
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

    const allConverted = files.length > 0 && files.every(f => convertedFiles[f.id]);

    const handlePrimaryAction = () => {
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
    };

    return (
        <div className="w-full space-y-8">
            {files.length === 0 && (
                <div className="mt-6 w-full max-w-7xl mx-auto">
                    <div className="rounded-xl border border-border bg-white shadow-xl p-4 md:p-8">
                        <ImageUploader
                            onUpload={handleUpload}
                            accept={ACCEPTED_EXTENSIONS}
                        />
                    </div>
                </div>
            )}

            <ToolModal
                isOpen={files.length > 0}
                onClose={clearAll}
                title="Image Converter"
                files={files}
                activeIndex={activeIndex}
                setActiveIndex={setActiveIndex}
                onPrimaryAction={handlePrimaryAction}
                primaryActionText={
                    <span className="flex items-center justify-center gap-2">
                        {allConverted ? (
                            <>
                                <Icon name="download" size={18} />
                                {files.length > 1 ? "Download ZIP" : "Download Image"}
                            </>
                        ) : (
                            <>
                                <Icon name="arrow-right" size={18} />
                                Convert to {targetFormat.toUpperCase()}
                            </>
                        )}
                    </span>
                }
                isProcessing={isConverting}
                customPreview={
                    allConverted && activeFile && convertedFiles[activeFile.id] ? (
                        <div className="w-full h-full p-4 md:p-8 flex items-center justify-center relative">
                            <img
                                src={convertedFiles[activeFile.id]}
                                alt="Converted Preview"
                                className="max-w-full max-h-full object-contain pointer-events-none drop-shadow-sm"
                            />

                            <div className="absolute bottom-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm text-[10px] font-bold uppercase tracking-wider text-[#0081C9] flex items-center gap-1.5 z-10">
                                <Icon name="check-circle" size={14} /> Converted to {targetFormat.toUpperCase()}
                            </div>
                        </div>
                    ) : undefined
                }
            >
                {/* TOOL SPECIFIC SIDEBAR CONTENT */}
                {activeFile && (
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 mb-6 font-sans">Convert Options</h2>

                            {/* Stats Info Box */}
                            <div className="bg-[#E8ECEF] rounded-xl p-4 flex flex-col gap-3 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="bg-white p-2 rounded-lg shadow-sm">
                                        <Icon name="file-type-2" size={24} className="text-[#0081C9]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-slate-800 truncate text-sm">
                                            {files.length} Image{files.length !== 1 ? 's' : ''} Uploaded
                                        </p>
                                        <p className="text-xs text-slate-500 mt-0.5 font-medium">
                                            {allConverted ? 'Conversion complete' : 'Ready to convert'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Conversion Settings */}
                        <div className="space-y-6">

                            {/* Target Format */}
                            <div className="space-y-3">
                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 block mb-1">Target Format</label>
                                <div className="bg-[#E8ECEF] p-3 rounded-xl border border-transparent focus-within:border-[#0081C9] focus-within:bg-white transition-all space-y-1">
                                    <select
                                        className="w-full bg-transparent text-sm font-semibold text-slate-800 outline-none cursor-pointer"
                                        value={targetFormat}
                                        onChange={(e) => setTargetFormat(e.target.value)}
                                        disabled={isConverting || allConverted}
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
                            </div>

                            {/* Quality Slider (Lossy formats only) */}
                            {["jpg", "webp", "avif"].includes(targetFormat) && (
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center bg-[#E8ECEF] p-4 rounded-xl border border-transparent relative">
                                        <div className="flex flex-col w-full">
                                            <div className="flex justify-between items-center mb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                                <span>Quality</span>
                                                <span className="text-[#0081C9]">{quality}%</span>
                                            </div>
                                            <div className="relative w-full h-2 rounded-full cursor-pointer bg-slate-200">
                                                <div
                                                    className="absolute top-0 left-0 h-full bg-[#0081C9] pointer-events-none rounded-full"
                                                    style={{ width: `${quality}% ` }}
                                                ></div>
                                                <input
                                                    type="range"
                                                    min="10"
                                                    max="100"
                                                    step="5"
                                                    value={quality}
                                                    onChange={(e) => setQuality(Number(e.target.value))}
                                                    disabled={isConverting || allConverted}
                                                    className="absolute top-0 left-0 w-full opacity-0 cursor-pointer z-10 h-full"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Background Color (JPG only) */}
                            {targetFormat === "jpg" && (
                                <div className="space-y-3">
                                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 block mb-1">Background Color</label>
                                    <div className="bg-[#E8ECEF] p-3 rounded-xl border border-transparent focus-within:border-[#0081C9] focus-within:bg-white transition-all space-y-1">
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="color"
                                                value={backgroundColor}
                                                onChange={(e) => setBackgroundColor(e.target.value)}
                                                disabled={isConverting || allConverted}
                                                className="h-8 w-12 p-0 rounded border-0 cursor-pointer bg-transparent"
                                            />
                                            <span className="text-sm font-semibold text-slate-800 uppercase">{backgroundColor}</span>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-medium">Replaces transparent backgrounds.</p>
                                </div>
                            )}

                        </div>
                    </div>
                )}
            </ToolModal>
        </div>
    );
}
