"use client";

import { useState } from "react";
import { ImageUploader } from "@/components/tools/ImageUploader";
import { ToolModal } from "@/components/modal/ToolModal";
import { Icon } from "@/components/ui/Icon";
import { useFileUpload } from "@/hooks/useFileUpload";

export default function ImageToPdfTool() {
    const {
        files,
        activeIndex,
        setActiveIndex,
        activeFile,
        addFiles,
        clearAll
    } = useFileUpload([]);

    const [isProcessing, setIsProcessing] = useState(false);

    const handleUpload = async (uploadedFiles: File[]) => {
        // Simple direct mapping
        addFiles(uploadedFiles, {
            // Optional default settings if required later
        });
    };

    const handleProcess = () => {
        setIsProcessing(true);
        setTimeout(() => setIsProcessing(false), 2000);
    };

    return (
        <div className="w-full space-y-8">
            {files.length === 0 && (
                <div className="mt-6 w-full max-w-7xl mx-auto">
                    <div className="rounded-2xl border border-border bg-surface shadow-xl p-4 md:p-8 backdrop-blur-sm">
                        <ImageUploader onUpload={handleUpload} />
                    </div>
                </div>
            )}

            <ToolModal
                isOpen={files.length > 0}
                onClose={clearAll}
                title="Image to PDF"
                files={files}
                activeIndex={activeIndex}
                setActiveIndex={setActiveIndex}
                onPrimaryAction={handleProcess}
                primaryActionText={
                    <span className="flex items-center justify-center gap-2">
                        <Icon name="file-plus" size={18} />
                        Generate PDF
                    </span>
                }
                isProcessing={isProcessing}
            >
                {/* TOOL SPECIFIC SIDEBAR CONTENT */}
                {activeFile && (
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 mb-6 font-sans">Image to PDF</h2>

                            {/* Stats Info Box */}
                            <div className="bg-[#E8ECEF] rounded-xl p-4 flex flex-col gap-3 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="bg-white p-2 rounded-lg shadow-sm">
                                        <Icon name="file-text" size={24} className="text-[#0081C9]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-slate-800 truncate text-sm">Batch of {files.length} Images</p>
                                        <p className="text-xs text-slate-500 mt-0.5 font-medium">
                                            Ready for conversion
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* PDF Settings */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-slate-800">PDF Options</h3>

                            {/* Custom Select Formats mapped to the style */}
                            <div className="space-y-4">
                                <div className="bg-[#E8ECEF] p-3 rounded-xl border border-transparent focus-within:border-[#0081C9] focus-within:bg-white transition-all space-y-1">
                                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 block mb-1">Page Size</label>
                                    <select className="w-full bg-transparent text-sm font-semibold text-slate-800 outline-none cursor-pointer">
                                        <option value="a4-p">A4 (Portrait)</option>
                                        <option value="a4-l">A4 (Landscape)</option>
                                        <option value="us-letter">US Letter</option>
                                    </select>
                                </div>

                                <div className="bg-[#E8ECEF] p-3 rounded-xl border border-transparent focus-within:border-[#0081C9] focus-within:bg-white transition-all space-y-1">
                                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 block mb-1">Margin</label>
                                    <select className="w-full bg-transparent text-sm font-semibold text-slate-800 outline-none cursor-pointer">
                                        <option value="none">None (0px)</option>
                                        <option value="small">Small (10px)</option>
                                        <option value="large">Large (24px)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </ToolModal>
        </div>
    );
}
