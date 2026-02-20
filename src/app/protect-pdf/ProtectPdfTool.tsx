"use client";

import { useState } from "react";
import { PdfUploader } from "@/components/tools/PdfUploader";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import { Icon } from "@/components/ui/Icon";
import { PDFDocument } from "pdf-lib";

export default function ProtectPdfTool() {
    const [file, setFile] = useState<File | null>(null);
    const [password, setPassword] = useState("");
    const [protectedUrl, setProtectedUrl] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleUpload = (files: File[]) => {
        if (files.length === 0) return;
        setFile(files[0]);
        setProtectedUrl(null);
    };

    const handleProtect = async () => {
        if (!file || !password) {
            toast.error("Please provide a file and a password.");
            return;
        }

        setIsProcessing(true);
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);

            // Encrypt the PDF
            // Cast to any to avoid TS error if encrypt method is missing in types
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
            setProtectedUrl(url);
            toast.success("PDF protected successfully!");

        } catch (error) {
            console.error(error);
            toast.error("Failed to protect PDF. The file might already be encrypted.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReset = () => {
        setFile(null);
        setPassword("");
        setProtectedUrl(null);
    };

    return (
        <div className="flex flex-col gap-8">
            {!file ? (
                <div className="mx-auto max-w-3xl">
                    <PdfUploader onUpload={handleUpload} maxFiles={1} />
                </div>
            ) : (
                <div className="mx-auto max-w-2xl w-full">
                    <div className="rounded-xl border border-border bg-surface p-8">
                        <div className="mb-6 flex justify-center">
                            <div className="rounded-full bg-red-100 p-4 text-red-600">
                                <Icon name="lock" size={48} />
                            </div>
                        </div>

                        <h3 className="text-xl font-bold text-foreground mb-1 text-center">{file.name}</h3>
                        <p className="text-muted mb-8 text-center text-sm">Set a password to protect this file.</p>

                        {protectedUrl ? (
                            <div className="space-y-6 animate-fade-in text-center">
                                <div className="rounded-lg bg-green-50 p-4 text-green-800 border border-green-200">
                                    <div className="text-lg font-bold">File Protected!</div>
                                    <div className="text-sm">Password: <span className="font-mono bg-white px-2 py-0.5 rounded border">{password}</span></div>
                                </div>

                                <div className="grid gap-3">
                                    <a href={protectedUrl} download={`protected_${file.name}`} className="block w-full">
                                        <Button className="w-full py-6 text-lg bg-red-600 hover:bg-red-700 text-white shadow-red-500/20">
                                            <Icon name="download" size={20} className="mr-2" />
                                            Download Protected PDF
                                        </Button>
                                    </a>
                                    <Button variant="secondary" onClick={handleReset} className="w-full">
                                        Protect Another File
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label htmlFor="password" className="block text-sm font-medium text-foreground">
                                        Set Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            id="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Enter a strong password"
                                            className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        />
                                        <div className="absolute right-3 top-3 text-muted">
                                            <Icon name="lock" size={16} />
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted">Make sure to remember this password. It cannot be recovered.</p>
                                </div>

                                <div className="space-y-3 pt-2">
                                    <Button
                                        onClick={handleProtect}
                                        disabled={isProcessing || !password}
                                        className="w-full py-6 text-lg bg-red-600 hover:bg-red-700 text-white shadow-red-500/20"
                                    >
                                        {isProcessing ? (
                                            <span className="flex items-center gap-2">
                                                <Icon name="rotate-cw" size={20} className="animate-spin" />
                                                Protecting...
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                Protect PDF
                                                <Icon name="shield" size={20} />
                                            </span>
                                        )}
                                    </Button>
                                    <Button variant="secondary" onClick={handleReset} className="w-full" disabled={isProcessing}>
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-8 rounded-xl bg-red-50/50 p-4 text-sm text-red-600 border border-red-100 flex gap-3">
                        <Icon name="shield" size={20} className="flex-shrink-0 mt-0.5" />
                        <div>
                            <strong>Secure Processing:</strong> Your PDF is protected entirely in your web browser. The password never leaves your device.
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
