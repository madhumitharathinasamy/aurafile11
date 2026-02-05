"use client";

import { useState, useTransition } from "react";
// Removed PageHeader to implement custom compact layout
import { ImageUploader } from "@/components/tools/ImageUploader";
import { ResizeControls } from "@/components/tools/ResizeControls";
import { Button } from "@/components/ui/Button";
import { resizeImageAction } from "@/actions/tools";
import { toast } from "sonner";
import { Icon } from "@/components/ui/Icon";

export default function ResizePage() {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);
    const [aspectRatio, setAspectRatio] = useState(1);
    const [isPending, startTransition] = useTransition();
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

    const handleUpload = (uploadedFiles: File[]) => {
        const uploadedFile = uploadedFiles[0];
        if (!uploadedFile) return;

        setFile(uploadedFile);
        const objectUrl = URL.createObjectURL(uploadedFile);
        setPreview(objectUrl);
        setDownloadUrl(null); // Reset previous result

        // Get original dimensions
        const img = new Image();
        img.src = objectUrl;
        img.onload = () => {
            setWidth(img.width);
            setHeight(img.height);
            setAspectRatio(img.width / img.height);
        };
    };

    const handleResize = () => {
        if (!file) return;

        startTransition(async () => {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("width", width.toString());
            formData.append("height", height.toString());

            const result = await resizeImageAction(formData);

            if (result.success && result.daa) {
                setDownloadUrl(result.daa);
                toast.success("Image resized successfully!");
            } else {
                toast.error(result.error || "Failed to resize image");
            }
        });
    };

    return (
        <>
            <main className="container" style={{ paddingBottom: "6rem", maxWidth: "900px", paddingTop: "0" }}>

                {/* Compact Header for Direct Access */}
                <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                    <h1 style={{
                        fontSize: "2rem",
                        fontWeight: 700,
                        color: "var(--primary)",
                        marginBottom: "0.5rem"
                    }}>
                        Resize Image
                    </h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                        Change image dimensions without losing quality.
                    </p>
                </div>

                {!file ? (
                    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                        <ImageUploader onUpload={handleUpload} />
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                        {/* Preview Section */}
                        <div style={{
                            background: "var(--surface)",
                            padding: "2rem",
                            borderRadius: "var(--radius-lg)",
                            textAlign: "center",
                            border: "1px solid var(--border)",
                            overflow: "hidden" // Contain scaled image
                        }}>
                            <div style={{
                                display: "inline-block",
                                maxWidth: "100%",
                                border: "1px dashed var(--border)",
                                transition: "all 0.3s ease"
                            }}>
                                <img
                                    src={preview!}
                                    alt="Preview"
                                    style={{
                                        maxWidth: "100%",
                                        maxHeight: "300px",
                                        // Simulate the new aspect ratio visually
                                        // We calculate scale based on original vs new ratio
                                        // This is a visual approximation to show "stretch"
                                        aspectRatio: `${width} / ${height}`,
                                        objectFit: "fill", // Force stretch to show distortion
                                        width: "auto",
                                        height: "auto",
                                        minHeight: "100px" // Prevent collapse
                                    }}
                                />
                            </div>
                            <div style={{ marginTop: "1rem" }}>
                                <Button
                                    variant="secondary"
                                    onClick={() => {
                                        setFile(null);
                                        setPreview(null);
                                        setDownloadUrl(null);
                                    }}
                                >
                                    Choose Different Image
                                </Button>
                            </div>
                        </div>

                        {/* Controls Section */}
                        <ResizeControls
                            width={width}
                            height={height}
                            aspectRatio={aspectRatio}
                            onWidthChange={setWidth}
                            onHeightChange={setHeight}
                        />

                        {/* Action Section */}
                        <div style={{ textAlign: "center" }}>
                            {!downloadUrl ? (
                                <Button
                                    variant="primary"
                                    onClick={handleResize}
                                    disabled={isPending}
                                    style={{ width: "100%", maxWidth: "300px", padding: "1rem", fontSize: "1.1rem" }}
                                >
                                    {isPending ? "Processing..." : "Resize Image"}
                                    {!isPending && <Icon name="zap" size={20} style={{ marginLeft: "0.5rem" }} />}
                                </Button>
                            ) : (
                                <a href={downloadUrl} download={`resized-${file.name}`}>
                                    <Button
                                        variant="primary"
                                        style={{ width: "100%", maxWidth: "300px", background: "#10b981", padding: "1rem", fontSize: "1.1rem" }}
                                    >
                                        Download Image
                                        <Icon name="resize" size={20} style={{ marginLeft: "0.5rem" }} />
                                    </Button>
                                </a>
                            )}
                        </div>
                    </div>
                )}

                {/* Content Section: SEO & Instructions */}
                <div style={{ marginTop: "3rem", borderTop: "1px solid var(--border)", paddingTop: "2rem" }}>
                    <section style={{ marginBottom: "4rem" }}>
                        <h2 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "1.5rem", color: "var(--foreground)" }}>
                            How to Resize Images Online?
                        </h2>
                        <ol style={{
                            display: "grid",
                            gap: "1.5rem",
                            counterReset: "step",
                            listStyle: "none",
                            padding: 0
                        }}>
                            {[
                                "Upload your image (JPG, PNG, or WEBP).",
                                "Enter your desired Width or Height in pixels.",
                                "Keep the 'Lock Aspect Ratio' on to avoid stretching.",
                                "Click 'Resize Image' and download your new file instantly."
                            ].map((step, i) => (
                                <li key={i} style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                                    <span style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        width: "32px",
                                        height: "32px",
                                        background: "var(--primary)",
                                        color: "white",
                                        borderRadius: "50%",
                                        fontWeight: "bold",
                                        flexShrink: 0
                                    }}>{i + 1}</span>
                                    <span style={{ fontSize: "1.125rem", color: "var(--text-secondary)", lineHeight: "1.6" }}>{step}</span>
                                </li>
                            ))}
                        </ol>
                    </section>
                    <section>
                        <h2 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "1.5rem", color: "var(--foreground)" }}>
                            Why use the Aura File Resizer?
                        </h2>
                        <div style={{ display: "grid", gap: "2rem", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
                            <div>
                                <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem" }}>🔒 100% Private</h3>
                                <p style={{ color: "var(--text-secondary)", lineHeight: "1.6" }}>
                                    Your images are processed securely and never reused. Server-side files are deleted immediately.
                                </p>
                            </div>
                            <div>
                                <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem" }}>⚡ Lightning Fast</h3>
                                <p style={{ color: "var(--text-secondary)", lineHeight: "1.6" }}>
                                    Powered by high-performance servers, resizing even large 4K images takes milliseconds.
                                </p>
                            </div>
                            <div>
                                <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem" }}>📐 Precision Control</h3>
                                <p style={{ color: "var(--text-secondary)", lineHeight: "1.6" }}>
                                    Set exact pixel dimensions while maintaining quality. Perfect for social media, web, or print.
                                </p>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </>
    );
}
