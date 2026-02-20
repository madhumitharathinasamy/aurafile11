
/**
 * Resizes an image using the HTML5 Canvas API.
 * This runs entirely on the client side.
 */

export interface ResizeOptions {
    width: number;
    height: number;
    maintainAspectRatio: boolean;
    format: "image/jpeg" | "image/png" | "image/webp";
    quality: number; // 0 to 1
    fit?: "fill" | "contain" | "cover";
    background?: string; // Hex color for padding if contain/cover
}

export async function resizeImageClient(file: File, options: ResizeOptions): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(url);

            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            if (!ctx) {
                reject(new Error("Failed to get canvas context"));
                return;
            }

            // Set canvas dimensions
            canvas.width = options.width;
            canvas.height = options.height;

            // Background fill
            if (options.background && options.format !== "image/png") {
                ctx.fillStyle = options.background;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            // Calculate draw dimensions (Basic fill for now, can expand for fit modes)
            // For now, assume 'fill' (stretch) or exact dimensions provided by caller
            ctx.drawImage(img, 0, 0, options.width, options.height);

            canvas.toBlob(
                (blob) => {
                    if (blob) resolve(blob);
                    else reject(new Error("Canvas toBlob failed"));
                },
                options.format,
                options.quality
            );
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("Failed to load image"));
        };

        img.src = url;
    });
}

export function calculateAspectRatioFit(
    srcWidth: number,
    srcHeight: number,
    maxWidth?: number,
    maxHeight?: number
): { width: number; height: number } {
    const ratio = Math.min(
        maxWidth ? maxWidth / srcWidth : Infinity,
        maxHeight ? maxHeight / srcHeight : Infinity
    );
    return {
        width: Math.round(srcWidth * (ratio === Infinity ? 1 : ratio)),
        height: Math.round(srcHeight * (ratio === Infinity ? 1 : ratio)),
    };
}
