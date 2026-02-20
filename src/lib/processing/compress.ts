import sharp from "sharp";

export async function processCompressImage(
    buffer: Buffer,
    quality: number,
    originalFormat: string,
    targetFormat?: string
): Promise<{ buffer: Buffer; format: string; size: number }> {
    try {
        // Only enable animation for formats that support it to prevent issues with BMP/JPEG
        const isAnimatable = originalFormat.includes("gif") || originalFormat.includes("webp") || originalFormat.includes("avif");
        let pipeline = sharp(buffer, { failOnError: false, animated: isAnimatable });

        // Determine the output format: use targetFormat if provided, otherwise default to originalFormat logic
        // Normalized format strings: "jpeg", "png", "webp", "gif", "avif", "tiff"
        let format = targetFormat || "jpeg";
        // const isConversion = !!targetFormat; // Unused

        console.log(`Processing image: Input=${originalFormat}, Output=${format}, Quality=${quality}`);

        // If no target format specified, infer from original format
        if (!targetFormat) {
            if (originalFormat.includes("png")) format = "png";
            else if (originalFormat.includes("webp")) format = "webp";
            else if (originalFormat.includes("gif")) format = "gif";
            else if (originalFormat.includes("avif")) format = "avif";
            else if (originalFormat.includes("tiff")) format = "tiff";
            else if (originalFormat.includes("bmp")) format = "jpeg"; // BMP -> JPEG (Sharp doesn't write BMP)
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
            // Only use gif options if it was animated or explicit gif
            pipeline = pipeline.gif({
                colours: 128, // Reduce colors to compress
            });
        } else if (format === "avif") {
            pipeline = pipeline.avif({ quality: quality });
        } else if (format === "tiff") {
            // Hybrid TIFF Compression Logic:
            // > 90%: Use LZW (Lossless) - larger file size, perfect quality
            // <= 90%: Use JPEG (Lossy) - significantly smaller file size, adjustable quality
            if (quality > 90) {
                pipeline = pipeline.tiff({ compression: "lzw" });
            } else {
                pipeline = pipeline.tiff({ quality: quality, compression: "jpeg" });
            }
        } else {
            // JPEG / JPG
            format = "jpeg";
            pipeline = pipeline.jpeg({ quality: quality, mozjpeg: true });
        }

        // Special handling for BMP and ICO which Sharp doesn't output directly
        if (format === "bmp" || format === "ico") {
            const Jimp = require("jimp");
            const image = await Jimp.read(buffer);

            if (format === "bmp") {
                const mime = Jimp.MIME_BMP;
                const bufferBmp = await image.getBufferAsync(mime);
                return {
                    buffer: bufferBmp,
                    format: "bmp",
                    size: bufferBmp.length
                };
            }

            if (format === "ico") {
                // ICO typically needs resizing to standard icon sizes (e.g. 256x256 max)
                if (image.bitmap.width > 256 || image.bitmap.height > 256) {
                    image.resize(256, Jimp.AUTO);
                }
                // Use BMP MIME type as valid source for .ico extension usage in simple contexts
                const mime = Jimp.MIME_BMP;
                const bufferBmp = await image.getBufferAsync(mime);
                return {
                    buffer: bufferBmp,
                    format: "ico",
                    size: bufferBmp.length
                };
            }
        }

        // Return for Sharp pipeline (non-BMP/ICO)
        if (format !== "bmp" && format !== "ico") {
            const outputBuffer = await pipeline.toBuffer();
            return {
                buffer: outputBuffer,
                format: format,
                size: outputBuffer.length
            };
        }

        // Fallback if we fell through (shouldn't happen for supported formats)
        throw new Error(`Output format ${format} not supported`);
    } catch (error: any) {
        console.error("Compression Error:", error);
        // Better error message
        if (error.message && error.message.includes("Input buffer contains unsupported image format")) {
            throw new Error("Unsupported image format. Please convert to JPG or PNG.");
        }
        throw new Error("Failed to compress image: " + (error.message || "Unknown error"));
    }
}
