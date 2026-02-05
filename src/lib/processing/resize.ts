import sharp from "sharp";

export async function processResizeImages(
    buffer: Buffer,
    options: { width: number; height: number; format?: "png" | "jpeg" | "webp" }
): Promise<{ buffer: Buffer; format: string }> {
    try {
        let pipeline = sharp(buffer).resize({
            width: options.width,
            height: options.height,
            fit: "fill", // Force dimensions, ignoring aspect ratio (handled by frontend)
        });

        const format = options.format || "jpeg"; // Default to jpeg if not specified

        if (format === "png") {
            pipeline = pipeline.png();
        } else if (format === "webp") {
            pipeline = pipeline.webp();
        } else {
            pipeline = pipeline.jpeg();
        }

        const outputBuffer = await pipeline.toBuffer();
        return { buffer: outputBuffer, format };
    } catch (error) {
        console.error("Resize Error:", error);
        throw new Error("Failed to process image");
    }
}
