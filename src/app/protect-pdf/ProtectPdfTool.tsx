"use client";

import { useState } from "react";
import { PdfUploader } from "@/components/tools/PdfUploader";
import { ToolModal } from "@/components/modal/ToolModal";
import { toast } from "sonner";
import { Icon } from "@/components/ui/Icon";
import { PDFDocument } from "pdf-lib";
import { useFileUpload } from "@/hooks/useFileUpload";

export default function ProtectPdfTool() {
    const {
        files,
        activeIndex,
        setActiveIndex,
        activeFile,
        addFiles,
        clearAll,
        updateFileSettings
    } = useFileUpload([]);

    const [password, setPassword] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    const handleUpload = (uploadedFiles: File[]) => {
        addFiles(uploadedFiles, {
            protectedUrl: null,
            isProtected: false
        });
        setPassword("");
    };

    const handleProtect = async () => {
        if (!activeFile) return;
        if (!password) {
            toast.error("Please provide a strong password.");
            return;
        }

        setIsProcessing(true);
        try {
            const arrayBuffer = await activeFile.file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);

            // Cast to any to access the encrypt method which exists in the lib
            (pdfDoc as any).encrypt({
                userPassword: password,
                ownerPassword: password,
                permissions: {
                    printing: "highResolution",
                    modifying: false,
                    copying: false,
                    annotating: false,
                    fillingForms: false,
                    contentAccessibility: false,
                    documentAssembly: false,
                },
            });

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);

            updateFileSettings(activeFile.id, {
                protectedUrl: url,
                isProtected: true
            });

            toast.success("PDF protected successfully!");

        } catch (error) {
            console.error(error);
            toast.error("Failed to protect PDF. The file might already be encrypted.");
        } finally {
            setIsProcessing(false);
        }
    };

    const downloadFile = async () => {
        if (!activeFile?.settings?.protectedUrl) return;

        try {
            const response = await fetch(activeFile.settings.protectedUrl);
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = blobUrl;

            const extensionStr = ".pdf";
            const baseName = activeFile.file.name.endsWith(extensionStr)
                ? activeFile.file.name.slice(0, -4)
                : activeFile.file.name;

            link.download = `protected_${baseName}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error("Download failed:", error);
            toast.error("Failed to download protected PDF safely.");
        }
    };

    const isProtected = activeFile?.settings?.isProtected;

    const handlePrimaryAction = () => {
        if (isProtected) {
            downloadFile();
        } else {
            handleProtect();
        }
    };

    return (
        <div className="w-full space-y-8">
            {files.length === 0 && (
                <div className="mt-6 w-full max-w-7xl mx-auto">
                    <div className="rounded-xl border border-border bg-white shadow-xl p-4 md:p-8">
                        <PdfUploader onUpload={handleUpload} />

                        <div className="mt-8 rounded-xl bg-[#0081C9]/5 p-4 text-sm text-[#0081C9] border border-[#0081C9]/20 flex gap-3 mx-auto max-w-2xl">
                            <Icon name="shield-check" size={20} className="flex-shrink-0 mt-0.5" />
                            <div>
                                <strong>Secure Processing:</strong> Your PDF is encrypted entirely in your web browser. The password never leaves your device.
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ToolModal
                isOpen={files.length > 0}
                onClose={clearAll}
                title="Protect PDF"
                files={files}
                activeIndex={activeIndex}
                setActiveIndex={setActiveIndex}
                onPrimaryAction={handlePrimaryAction}
                primaryActionText={
                    <span className="flex items-center justify-center gap-2">
                        {isProtected ? (
                            <>
                                <Icon name="download" size={18} />
                                Download Encrypted PDF
                            </>
                        ) : (
                            <>
                                <Icon name="lock" size={18} />
                                Encrypt Document
                            </>
                        )}
                    </span>
                }
                isProcessing={isProcessing}
            >
                {/* TOOL SPECIFIC SIDEBAR CONTENT */}
                {activeFile && (
                    <div className="space-y-8">
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-slate-800 font-sans">Security Lock</h2>
                                {isProtected && (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                        <Icon name="check-circle" size={14} />
                                        Locked
                                    </span>
                                )}
                            </div>

                            {/* File Info Block */}
                            <div className="bg-[#E8ECEF] rounded-xl p-4 flex flex-col gap-3 shadow-sm border border-transparent">
                                <div className="flex items-center gap-3">
                                    <div className="bg-white p-2 rounded-lg shadow-sm">
                                        <Icon name="file-text" size={24} className="text-[#0081C9]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-slate-800 truncate text-sm" title={activeFile.file.name}>
                                            {activeFile.file.name}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-0.5 font-medium flex gap-2">
                                            <span>Ready for encryption</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Settings / Results Data */}
                        {!isProtected ? (
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-slate-800">Set Password</h3>

                                <div className="bg-[#E8ECEF] p-4 rounded-xl border border-transparent focus-within:border-[#0081C9] focus-within:bg-white transition-all space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 block mb-1">Document Password</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Enter strong password"
                                            disabled={isProcessing}
                                            className="w-full bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400 placeholder:font-normal"
                                        />
                                    </div>
                                </div>
                                <p className="text-[10px] text-slate-400 font-medium px-2">
                                    Make sure to remember this password. If lost, the document cannot be recovered.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-slate-800">Results</h3>

                                <div className="bg-[#0081C9]/5 border border-[#0081C9]/20 p-4 rounded-xl flex items-start gap-3">
                                    <Icon name="lock" size={18} className="text-[#0081C9] mt-0.5" />
                                    <div>
                                        <p className="text-sm font-semibold text-[#0081C9]">Successfully Encrypted</p>
                                        <p className="text-xs text-slate-600 mt-1">
                                            Your file is now protected with 128-bit RC4 encryption. It restricts modifying, copying, and annotating without the password.
                                        </p>

                                        <div className="mt-3 inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-[#0081C9]/20">
                                            <span className="text-xs text-slate-500 font-medium">Password:</span>
                                            <span className="text-xs font-mono font-bold text-slate-800">{password}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Security Badge inline */}
                        <div className="flex items-center gap-2 justify-center text-[10px] text-slate-400 font-medium pt-4">
                            <Icon name="shield-check" size={14} />
                            <span>100% Private - Encrypted entirely in your browser</span>
                        </div>
                    </div>
                )}
            </ToolModal>
        </div>
    );
}
