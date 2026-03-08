import sharp from "sharp";

export async function processCompressImage(
    buffer: Buffer,
    quality: number,
    originalFormat: string,
    targetFormat?: string,
    backgroundColor?: string,
    advancedSettings?: {
        targetMode?: boolean;
        targetSizeUnit?: string;
        targetSizeValue?: string;
        strategy?: string; // 'lossy' | 'lossless' | 'auto'
        preserveMetadata?: boolean;
        chromaSubsampling?: string; // '4:4:4' | '4:2:0' | 'auto'
    }
): Promise<{ buffer: Buffer; format: string; size: number }> {
    try {
        const isAnimatable = originalFormat.includes("gif") || originalFormat.includes("webp") || originalFormat.includes("avif");

        let format = targetFormat || "jpeg";

        if (!targetFormat) {
            if (originalFormat.includes("png")) format = "png";
            else if (originalFormat.includes("webp")) format = "webp";
            else if (originalFormat.includes("gif")) format = "gif";
            else if (originalFormat.includes("avif")) format = "avif";
            else if (originalFormat.includes("tiff")) format = "tiff";
            else if (originalFormat.includes("bmp")) format = "jpeg";
            else format = "jpeg";
        }

        const runCompression = async (q: number) => {
            let pipeline = sharp(buffer, { failOnError: false, animated: isAnimatable });

            if (!advancedSettings || advancedSettings.preserveMetadata !== false) {
                pipeline = pipeline.withMetadata();
            }

            const chroma = advancedSettings?.chromaSubsampling === "4:4:4" ? "4:4:4" : "4:2:0";
            const isLossless = advancedSettings?.strategy === "lossless";

            if (format === "png") {
                pipeline = pipeline.png({
                    quality: q,
                    compressionLevel: 9,
                    palette: !isLossless
                });
            } else if (format === "webp") {
                pipeline = pipeline.webp({ quality: q, lossless: isLossless });
            } else if (format === "gif") {
                pipeline = pipeline.gif({ colours: Math.max(2, Math.floor((q / 100) * 256)) });
            } else if (format === "avif") {
                pipeline = pipeline.avif({ quality: q, lossless: isLossless });
            } else if (format === "tiff") {
                if (isLossless || q > 90) {
                    pipeline = pipeline.tiff({ compression: "lzw" });
                } else {
                    pipeline = pipeline.tiff({ quality: q, compression: "jpeg" });
                }
            } else {
                format = "jpeg";
                if (backgroundColor) {
                    pipeline = pipeline.flatten({ background: backgroundColor });
                }
                pipeline = pipeline.jpeg({ quality: q, mozjpeg: true, chromaSubsampling: chroma });
            }

            if (format === "bmp" || format === "ico") {
                const Jimp = require("jimp");
                const image = await Jimp.read(buffer);

                if (format === "bmp") {
                    const mime = Jimp.MIME_BMP;
                    const bufferBmp = await image.getBufferAsync(mime);
                    return { buffer: bufferBmp, format: "bmp", size: bufferBmp.length };
                }

                if (format === "ico") {
                    if (image.bitmap.width > 256 || image.bitmap.height > 256) {
                        image.resize(256, Jimp.AUTO);
                    }
                    const mime = Jimp.MIME_BMP;
                    const bufferBmp = await image.getBufferAsync(mime);
                    return { buffer: bufferBmp, format: "ico", size: bufferBmp.length };
                }
            }

            if (format !== "bmp" && format !== "ico") {
                const outputBuffer = await pipeline.toBuffer();
                return {
                    buffer: outputBuffer,
                    format: format,
                    size: outputBuffer.length
                };
            }

            throw new Error(`Output format ${format} not supported`);
        };

        if (advancedSettings?.targetMode && advancedSettings.targetSizeValue) {
            const numVal = parseFloat(advancedSettings.targetSizeValue);
            if (!isNaN(numVal) && numVal > 0) {
                const targetBytes = numVal * (advancedSettings.targetSizeUnit === "MB" ? 1024 * 1024 : 1024);

                let minQ = 1;
                let maxQ = 100;
                let bestResult = null;
                let iterations = 0;

                while (minQ <= maxQ && iterations < 7) {
                    const midQ = Math.floor((minQ + maxQ) / 2);
                    const result = await runCompression(midQ);

                    if (result.size <= targetBytes) {
                        bestResult = result;
                        minQ = midQ + 1;
                    } else {
                        maxQ = midQ - 1;
                    }
                    iterations++;
                }
                if (bestResult) {
                    return bestResult;
                } else {
                    // Even at quality 1, the file is larger than the target size.
                    // Return the minimum possible quality result rather than failing.
                    return await runCompression(1);
                }
            }
        }

        return await runCompression(quality);
    } catch (error: any) {
        // Better error message
        if (error.message && error.message.includes("Input buffer contains unsupported image format")) {
            throw new Error("Unsupported image format. Please convert to JPG or PNG.");
        }
        throw new Error("Failed to compress image: " + (error.message || "Unknown error"));
    }
}
