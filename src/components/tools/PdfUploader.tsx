"use client";

import { useDropzone } from "react-dropzone";
import { Icon } from "@/components/ui/Icon";
import { toast } from "sonner";

interface PdfUploaderProps {
    onUpload: (files: File[]) => void;
    maxFiles?: number;
}

export function PdfUploader({ onUpload, maxFiles = 1 }: PdfUploaderProps) {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: (acceptedFiles) => {
            if (acceptedFiles?.length > 0) {
                onUpload(acceptedFiles);
            }
        },
        accept: {
            "application/pdf": [".pdf"],
        },
        maxFiles: maxFiles,
        maxSize: 50 * 1024 * 1024, // 50MB
        onDropRejected: (rejectedFiles) => {
            const error = rejectedFiles[0]?.errors[0];
            if (error?.code === "file-too-large") {
                toast.error("File is too large. Max size is 50MB.");
            } else if (error?.code === "file-invalid-type") {
                toast.error("Invalid file type. Please upload a PDF file.");
            } else {
                toast.error(`Error: ${error?.message || "File rejected"}`);
            }
        }
    });

    return (
        <div
            {...getRootProps()}
            className={`rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-200 ease-in-out ${isDragActive
                ? "border-red-500 bg-red-500/5"
                : "border-border bg-surface hover:border-red-500/50 hover:bg-background"
                }`}
        >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-4">
                <div className="mb-2 rounded-full bg-red-50 p-4 shadow-sm dark:bg-red-900/20">
                    <Icon name="file-text" size={48} className="text-red-600" />
                </div>
                <p className="text-lg font-medium text-foreground">
                    {isDragActive
                        ? "Drop the PDF here..."
                        : "Drag & drop a PDF here, or click to select"}
                </p>
                <p className="text-sm text-muted">Supports PDF (Max 50MB)</p>
            </div>
        </div>
    );
}
