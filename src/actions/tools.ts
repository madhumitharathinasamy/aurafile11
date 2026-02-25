
"use server";

import { processCompressImage } from "@/lib/processing/compress";



export type CompressActionResult = {
    success: boolean;
    data?: string;
    originalSize?: number;
    newSize?: number;
    error?: string;
    originalPreview?: string;
    compressedPreview?: string;
}

export async function compressImageAction(formData: FormData): Promise<CompressActionResult> {
    try {
        const file = formData.get("file") as File;
        const qualityRaw = formData.get("quality");
        const quality = qualityRaw ? parseInt(qualityRaw as string) : 80;

        const outputFormatRaw = formData.get("outputFormat") as string;
        const format = outputFormatRaw && outputFormatRaw !== "original" ? outputFormatRaw : undefined;

        const advancedSettings = {
            targetMode: formData.get("targetMode") === "true",
            targetSizeUnit: formData.get("targetSizeUnit") as string,
            targetSizeValue: formData.get("targetSizeValue") as string,
            strategy: formData.get("strategy") as string || "auto",
            preserveMetadata: formData.get("preserveMetadata") === "true",
            chromaSubsampling: formData.get("chromaSubsampling") as string || "auto"
        };

        if (!file) {
            return { success: false, error: "Missing required fields" };
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        if (buffer.length < file.size) {
            throw new Error(`Upload truncated! Received ${buffer.length} of ${file.size} bytes. Please restart the server to apply limit changes.`);
        }

        const result = await processCompressImage(buffer, quality, file.type, format, undefined, advancedSettings);

        const base64 = `data:image/${result.format};base64,${result.buffer.toString(
            "base64"
        )}`;

        // Generate Previews for non-web-safe formats (TIFF, etc.)
        let originalPreview: string | undefined;
        let compressedPreview: string | undefined;

        const isWebSafeInput = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"].includes(file.type);
        const isWebSafeOutput = ["jpeg", "png", "webp", "gif", "avif"].includes(result.format);

        if (!isWebSafeInput || !isWebSafeOutput) {
            console.log(`Generating previews for ${file.name} (Input: ${file.type}, Output: ${result.format})`);
            // Lazy import sharp to avoid issues if not needed, or just standard import
            const sharp = require("sharp");

            // If input is not web safe (e.g. TIFF), generate a JPEG preview for "Before" state
            if (!isWebSafeInput) {
                try {
                    const previewBuffer = await sharp(buffer).jpeg({ quality: 70 }).toBuffer();
                    originalPreview = `data:image/jpeg;base64,${previewBuffer.toString("base64")}`;
                    console.log("Original preview generated successfully");
                } catch (e) {
                    console.error("Failed to generate original preview", e);
                }
            }

            // If output is not web safe (e.g. TIFF), generate a JPEG preview for "After" state
            if (!isWebSafeOutput) {
                try {
                    const previewBuffer = await sharp(result.buffer).jpeg({ quality: 70 }).toBuffer();
                    compressedPreview = `data:image/jpeg;base64,${previewBuffer.toString("base64")}`;
                    console.log("Compressed preview generated successfully");
                } catch (e) {
                    console.error("Failed to generate compressed preview", e);
                }
            }
        }

        return {
            success: true,
            data: base64,
            originalSize: file.size,
            newSize: result.size,
            originalPreview,
            compressedPreview
        };
    } catch (error: any) {
        console.error("Compression Action Error:", error);

        // Specific error handling for missing format support (common with HEIC)
        if (error.toString().includes("heif") || error.toString().includes("format has not been built in")) {
            return { success: false, error: "HEIC/HEIF format is not currently supported. Please convert to JPG or PNG first." };
        }

        return { success: false, error: error.message || "Failed to compress image" };
    }
}

export async function convertImageAction(formData: FormData) {
    try {
        const file = formData.get("file") as File;
        const format = formData.get("format") as string;
        const qualityRaw = formData.get("quality");
        const quality = qualityRaw ? parseInt(qualityRaw as string) : 90;
        const backgroundColor = formData.get("backgroundColor") as string | undefined;

        console.log(`Convert Action Received: Format=${format}, Quality=${quality}, Background=${backgroundColor || 'transparent'}`);

        if (!file || !format) {
            return { success: false, error: "Missing required fields" };
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        if (buffer.length < file.size) {
            throw new Error(`Upload truncated! Received ${buffer.length} of ${file.size} bytes.`);
        }

        // Reuse compression logic which handles format conversion and background flattening
        const result = await processCompressImage(buffer, quality, file.type, format, backgroundColor);

        const base64 = `data:image/${result.format};base64,${result.buffer.toString(
            "base64"
        )}`;

        return {
            success: true,
            data: base64,
            originalSize: file.size,
            newSize: result.size
        };
    } catch (error: any) {
        console.error("Convert Action Error:", error);
        if (error.toString().includes("heif") || error.toString().includes("format has not been built in")) {
            return { success: false, error: "HEIC/HEIF format is not currently supported." };
        }
        return { success: false, error: error.message || "Failed to convert image" };
    }
}
