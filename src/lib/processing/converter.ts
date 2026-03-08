import heic2any from "heic2any";
import UTIF from "utif";

export type ImageFormat = "image/jpeg" | "image/png" | "image/webp" | "image/gif" | "image/tiff" | "image/avif";

export interface ConversionOptions {
    format: ImageFormat;
    quality: number; // 0 to 1
    backgroundColor?: string; // Hex color for transparency filling
    stripMetadata: boolean;
}

export interface ConversionResult {
    blob: Blob;
    width: number;
    height: number;
}

export async function convertImageClient(file: File, options: ConversionOptions): Promise<ConversionResult> {
    // 1. Handle HEIC/HEIF
    let processingBlob: Blob = file;
    let isTiff = file.name.toLowerCase().endsWith(".tiff") || file.name.toLowerCase().endsWith(".tif") || file.type === "image/tiff";

    if (file.name.toLowerCase().endsWith(".heic") || file.type === "image/heic" || file.type === "image/heif") {
        try {
            const result = await heic2any({
                blob: file,
                toType: "image/jpeg",
                quality: 1,
            });
            // Handle single or multi-image result
            processingBlob = Array.isArray(result) ? result[0] : result;
        } catch (e) {
            throw new Error("HEIC conversion failed. Your browser might not support this format completely.");
        }
    }

    return new Promise((resolve, reject) => {
        // Special Handling for TIFF using UTIF.js
        if (isTiff) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const buffer = e.target?.result as ArrayBuffer;
                    if (!buffer) throw new Error("Failed to read TIFF file");

                    const ifds = UTIF.decode(buffer);
                    if (!ifds || ifds.length === 0) throw new Error("Invalid TIFF file");

                    const firstPage = ifds[0];
                    UTIF.decodeImage(buffer, firstPage);
                    const rgba = UTIF.toRGBA8(firstPage);

                    const canvas = document.createElement("canvas");
                    canvas.width = firstPage.width;
                    canvas.height = firstPage.height;
                    const ctx = canvas.getContext("2d");
                    if (!ctx) throw new Error("Failed to get canvas context");

                    const imageData = new ImageData(new Uint8ClampedArray(rgba), firstPage.width, firstPage.height);

                    // Handle Background / Transparency (TIFF might have transparency)
                    const targetSupportsAlpha = ["image/png", "image/webp", "image/gif", "image/avif"].includes(options.format);
                    const needsBackgroundFill = !targetSupportsAlpha || !!options.backgroundColor;

                    if (needsBackgroundFill) {
                        // Create a temporary canvas to draw the image data, then draw it over the background
                        const tempCanvas = document.createElement("canvas");
                        tempCanvas.width = firstPage.width;
                        tempCanvas.height = firstPage.height;
                        const tempCtx = tempCanvas.getContext("2d");
                        if (tempCtx) {
                            tempCtx.putImageData(imageData, 0, 0);

                            ctx.fillStyle = options.backgroundColor || "#FFFFFF";
                            ctx.fillRect(0, 0, canvas.width, canvas.height);
                            ctx.drawImage(tempCanvas, 0, 0);
                        } else {
                            ctx.putImageData(imageData, 0, 0); // Fallback
                        }
                    } else {
                        ctx.putImageData(imageData, 0, 0);
                    }

                    canvas.toBlob((blob) => {
                        if (blob) {
                            resolve({ blob, width: canvas.width, height: canvas.height });
                        } else {
                            reject(new Error("Canvas export failed"));
                        }
                    }, options.format, options.quality);

                } catch (error: any) {
                    reject(new Error("TIFF decoding failed: " + error.message));
                }
            };
            reader.onerror = () => reject(new Error("Failed to read file"));
            reader.readAsArrayBuffer(file);
            return;
        }

        // Standard Image Handling
        const img = new Image();
        const url = URL.createObjectURL(processingBlob);

        img.onload = () => {
            URL.revokeObjectURL(url);

            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            if (!ctx) {
                reject(new Error("Failed to get canvas context"));
                return;
            }

            canvas.width = img.width;
            canvas.height = img.height;

            // 2. Handle Background / Transparency
            // Determine if the target format supports transparency (alpha channel)
            const targetSupportsAlpha = ["image/png", "image/webp", "image/gif", "image/tiff", "image/avif"].includes(options.format);
            const needsBackgroundFill = !targetSupportsAlpha || !!options.backgroundColor;

            if (needsBackgroundFill) {
                ctx.fillStyle = options.backgroundColor || "#FFFFFF";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            // 3. Draw Image
            ctx.drawImage(img, 0, 0);

            // 4. Export to Blob (Canvas automatically strips EXIF)
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        resolve({
                            blob,
                            width: canvas.width,
                            height: canvas.height,
                        });
                    } else {
                        reject(new Error("Canvas export failed"));
                    }
                },
                options.format,
                options.quality
            );
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("Failed to load image. If this is a specialized format, it might not be supported directly."));
        };

        img.src = url;
    });
}
