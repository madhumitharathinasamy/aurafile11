import sharp from "sharp";

export async function processCompressImage(
    buffer: Buffer,
    quality: number,
    originalFormat: string,
    targetFormat?: string
): Promise<{ buffer: Buffer; format: string; size: number }> {
    try {
        // Enable animation support
        let pipeline = sharp(buffer, { failOnError: false, animated: true });

        // Determine the output format: use targetFormat if provided, otherwise default to originalFormat logic
        // Normalized format strings: "jpeg", "png", "webp", "gif", "avif", "tiff"
        let format = targetFormat || "jpeg";
        const isConversion = !!targetFormat;

        // If no target format specified, infer from original format
        if (!targetFormat) {
            if (originalFormat.includes("png")) format = "png";
            else if (originalFormat.includes("webp")) format = "webp";
            else if (originalFormat.includes("gif")) format = "gif";
            else if (originalFormat.includes("avif")) format = "avif";
            else if (originalFormat.includes("tiff")) format = "tiff";
            else format = "jpeg";
        }

        // Apply compression settings based on the determined format
        if (format === "png") {
            pipeline = pipeline.png({
                quality: quality,
                compressionLevel: 9,
                palette: true
            });
        } else if (format === "webp") {
            pipeline = pipeline.webp({ quality: quality });
        } else if (format === "gif") {
            // GIF compression: reuse existing palette often helps size, but re-optimizing with colours
            pipeline = pipeline.gif({
                colours: 128, // Reduce colors to compress
            });
        } else if (format === "avif") {
            pipeline = pipeline.avif({ quality: quality });
        } else if (format === "tiff") {
            pipeline = pipeline.tiff({ quality: quality });
        } else {
            // JPEG / JPG
            format = "jpeg";
            pipeline = pipeline.jpeg({ quality: quality, mozjpeg: true });
        }

        const outputBuffer = await pipeline.toBuffer();
        return {
            buffer: outputBuffer,
            format: format,
            size: outputBuffer.length
        };
    } catch (error) {
        console.error("Compression Error:", error);
        throw new Error("Failed to compress image");
    }
}
