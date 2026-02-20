"use client";

import { useDropzone } from "react-dropzone";
import { Icon } from "@/components/ui/Icon";
import { toast } from "sonner";

interface ImageUploaderProps {
    onUpload: (files: File[]) => void;
    multiple?: boolean;
    title?: string;
    description?: string;
    subDescription?: string;
    maxSize?: number; // in bytes
    maxFiles?: number;
    accept?: Record<string, string[]>;
}

export function ImageUploader({
    onUpload,
    multiple = false,
    title = "Drag & drop an image here, or click to select",
    description = "Supports JPG, PNG, WEBP, GIF, TIFF, AVIF, BMP",
    subDescription = "(Max 10 files, 25MB)",
    maxSize = 25 * 1024 * 1024, // Default 25MB
    maxFiles = 10, // Default 10
    accept = {
        "image/*": [".png", ".jpg", ".jpeg", ".webp", ".gif", ".tiff", ".avif", ".bmp"],
    }
}: ImageUploaderProps) {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: (acceptedFiles) => {
            if (acceptedFiles?.length > 0) {
                onUpload(acceptedFiles);
            }
        },
        accept,
        maxFiles: multiple ? maxFiles : 1,
        maxSize,
        onDropRejected: (rejectedFiles) => {
            const error = rejectedFiles[0]?.errors[0];
            if (error?.code === "file-too-large") {
                toast.error(`File is too large. Max size is ${Math.round(maxSize / 1024 / 1024)}MB.`);
            } else if (error?.code === "file-invalid-type") {
                toast.error("Invalid file type. Please upload a supported image format.");
            } else if (error?.code === "too-many-files") {
                toast.error(multiple ? `You can only upload up to ${maxFiles} files at once.` : "You can only upload 1 file.");
            } else {
                toast.error(`Combined Error: ${error?.message || "File rejected"}`);
            }
        }
    });

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div
                {...getRootProps()}
                className={`relative flex flex-col items-center justify-center gap-4 p-12 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 ${isDragActive
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 hover:bg-muted/50 bg-surface"
                    }`}
            >
                <input {...getInputProps()} data-testid="dropzone-file-input" />
                <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${isDragActive ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    <Icon name="upload" size={28} />
                </div>
                <div className="text-center">
                    <p className="text-base font-medium">Drag & drop your images</p>
                    <p className="text-sm text-muted-foreground mt-1">
                        or <span className="text-primary font-medium">browse</span> to choose files
                    </p>
                </div>
                <p className="text-xs text-muted-foreground">
                    Supports JPG, PNG, WEBP, GIF • Max {Math.round(maxSize / (1024 * 1024))}MB • {multiple ? "Multiple files" : "Single file"} supported
                </p>
            </div>
        </div>
    );
}
