"use server";

import { processResizeImages } from "@/lib/processing/resize";
import { processCompressImage } from "@/lib/processing/compress";

export async function resizeImageAction(formData: FormData) {
    try {
        const file = formData.get("file") as File;
        const width = parseInt(formData.get("width") as string);
        const height = parseInt(formData.get("height") as string);
        // const format = formData.get("format") as "png" | "jpeg" | "webp"; // Future feature

        if (!file || !width || !height) {
            return { success: false, error: "Missing required fields" };
        }

        // Convert File to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Process Image
        const result = await processResizeImages(buffer, {
            width,
            height,
            format: "jpeg", // Default to jpeg for resize
        });

        const base64 = `data:image/${result.format};base64,${result.buffer.toString(
            "base64"
        )}`;

        return { success: true, daa: base64 };
    } catch (error) {
        console.error("Action Error:", error);
        return { success: false, error: "Failed to process image" };
    }
}

export async function compressImageAction(formData: FormData) {
    try {
        const file = formData.get("file") as File;
        const quality = parseInt(formData.get("quality") as string);
        const format = formData.get("format") as string; // Optional target format

        if (!file || !quality) {
            return { success: false, error: "Missing required fields" };
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        if (buffer.length < file.size) {
            throw new Error(`Upload truncated! Received ${buffer.length} of ${file.size} bytes. Please restart the server to apply limit changes.`);
        }

        const result = await processCompressImage(buffer, quality, file.type, format);

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
        // Default to high quality for conversion if not specified, though logic essentially treats them same
        const quality = 90;

        if (!file || !format) {
            return { success: false, error: "Missing required fields" };
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        if (buffer.length < file.size) {
            throw new Error(`Upload truncated! Received ${buffer.length} of ${file.size} bytes.`);
        }

        // Reuse compression logic which handles format conversion
        const result = await processCompressImage(buffer, quality, file.type, format);

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
