"use client";

import { useState } from "react";
import { ImageUploader } from "@/components/tools/ImageUploader";
import { Icon } from "@/components/ui/Icon";
import { FileWithMeta } from "@/app/resize-image/types";

export default function ImageToPdfTool() {
    const [files, setFiles] = useState<FileWithMeta[]>([]);

    const handleUpload = async (uploadedFiles: File[]) => {
        const newFiles: FileWithMeta[] = uploadedFiles.map(file => ({
            id: crypto.randomUUID(),
            file,
            previewUrl: URL.createObjectURL(file),
            format: file.type.split('/')[1] || 'jpeg',
            size: file.size,
            originalWidth: 0,
            originalHeight: 0,
            settings: {
                width: 0,
                height: 0,
                lockAspectRatio: true,
                preset: '',
                mode: 'pixels',
                percentage: 100,
                format: 'image/jpeg',
                quality: 80
            }
        }));

        setFiles(prev => [...prev, ...newFiles]);
    };

    const handleClear = () => {
        files.forEach(f => URL.revokeObjectURL(f.previewUrl));
        setFiles([]);
    };

    return (
        <div className="w-full space-y-8">
            {files.length === 0 ? (
                <div className="mt-6 w-full max-w-7xl mx-auto">
                    <div className="rounded-2xl border border-border bg-surface shadow-xl p-4 md:p-8 backdrop-blur-sm">
                        <ImageUploader onUpload={handleUpload} multiple={true} />
                    </div>
                </div>
            ) : (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4">
                    <div className="rounded-2xl border border-border bg-surface shadow-xl shadow-primary/5 p-4 md:p-8 backdrop-blur-sm w-full max-w-7xl max-h-[90vh] overflow-y-auto flex flex-col items-center justify-start space-y-8">
                        {/* Header with Clear Button */}
                        <div className="flex justify-between items-center w-full bg-card p-4 rounded-xl border border-border shadow-sm">
                            <h2 className="text-xl font-semibold">Image to PDF</h2>
                            <button
                                onClick={handleClear}
                                className="px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors border border-transparent hover:border-destructive/20"
                            >
                                Cancel & Clear
                            </button>
                        </div>

                        <div className="bg-card w-full rounded-xl border border-border p-6 shadow-sm overflow-hidden flex flex-col items-center justify-center min-h-[400px]">
                            <Icon name="file-text" size={48} className="text-muted-foreground/50 mb-4" />
                            <h3 className="text-lg font-medium">PDF Layout Coming Soon</h3>
                            <p className="text-muted-foreground mb-6">You have uploaded {files.length} images.</p>

                            <div className="flex flex-wrap gap-4 justify-center">
                                {files.map(f => (
                                    <img key={f.id} src={f.previewUrl} alt="preview" className="w-24 h-24 object-cover rounded-lg border border-border/50 shadow-sm" />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
