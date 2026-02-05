"use client";

import { useDropzone } from "react-dropzone";
import { Icon } from "@/components/ui/Icon";
import { toast } from "sonner";

interface ImageUploaderProps {
    onUpload: (files: File[]) => void;
}

export function ImageUploader({ onUpload }: ImageUploaderProps) {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: (acceptedFiles) => {
            if (acceptedFiles?.length > 0) {
                onUpload(acceptedFiles);
            }
        },
        accept: {
            "image/*": [".png", ".jpg", ".jpeg", ".webp", ".gif", ".tiff", ".avif", ".bmp"],
        },
        maxFiles: 20, // Increased limit for batch processing
        maxSize: 25 * 1024 * 1024, // 25MB
        onDropRejected: (rejectedFiles) => {
            const error = rejectedFiles[0]?.errors[0];
            if (error?.code === "file-too-large") {
                toast.error("File is too large. Max size is 25MB.");
            } else if (error?.code === "file-invalid-type") {
                toast.error("Invalid file type. Please upload a supported image format.");
            } else {
                toast.error(`Combined Error: ${error?.message || "File rejected"}`);
            }
        }
    });

    return (
        <div
            {...getRootProps()}
            className={`rounded-xl border-2 border-dashed p-16 text-center cursor-pointer transition-all duration-200 ease-in-out ${isDragActive
                ? "border-primary bg-primary/5"
                : "border-border bg-surface hover:border-primary hover:bg-background"
                }`}
        >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-4">
                <div className="mb-2 rounded-full bg-white p-4 shadow-sm">
                    <Icon name="image" size={48} color="var(--primary)" />
                </div>
                <p className="text-lg font-medium text-foreground">
                    {isDragActive
                        ? "Drop the image here..."
                        : "Drag & drop an image here, or click to select"}
                </p>
                <p className="text-sm text-muted">Supports JPG, PNG, WEBP, GIF, TIFF, AVIF, BMP (Max 25MB)</p>
            </div>
        </div>
    );
}
