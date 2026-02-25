
/**
 * Resizes an image using the HTML5 Canvas API.
 * This runs entirely on the client side.
 */

export interface ResizeOptions {
    width: number;
    height: number;
    maintainAspectRatio: boolean;
    format: "original" | "image/jpeg" | "image/png" | "image/webp";
    quality: number; // 0 to 1
    fit?: "fill" | "contain" | "cover";
    background?: string; // Hex color for padding if contain/cover
    anchor?: "center" | "north" | "northeast" | "east" | "southeast" | "south" | "southwest" | "west" | "northwest";
    resampling?: "nearest" | "bilinear" | "bicubic" | "lanczos3";
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

            canvas.width = options.width;
            canvas.height = options.height;

            // Handle background
            if (options.background && options.background !== "transparent" && options.background !== "") {
                ctx.fillStyle = options.background;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            } else if (options.format === "image/jpeg") {
                // JPEGs don't support transparency, default to white if not specified
                ctx.fillStyle = "#FFFFFF";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            // Handle resampling algorithms mapping to canvas API
            if (options.resampling === "nearest") {
                ctx.imageSmoothingEnabled = false;
            } else {
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = (options.resampling === "bicubic" || options.resampling === "lanczos3") ? "high" : "low";
            }

            let drawX = 0;
            let drawY = 0;
            let drawW = options.width;
            let drawH = options.height;

            if (options.maintainAspectRatio || options.fit === "contain" || options.fit === "cover") {
                const imgRatio = img.width / img.height;
                const canvasRatio = canvas.width / canvas.height;

                const fitType = options.fit || "contain";

                if (fitType === "contain") {
                    if (imgRatio > canvasRatio) {
                        drawW = canvas.width;
                        drawH = canvas.width / imgRatio;
                    } else {
                        drawH = canvas.height;
                        drawW = canvas.height * imgRatio;
                    }
                } else if (fitType === "cover") {
                    if (imgRatio > canvasRatio) {
                        drawH = canvas.height;
                        drawW = canvas.height * imgRatio;
                    } else {
                        drawW = canvas.width;
                        drawH = canvas.width / imgRatio;
                    }
                }

                // Handle anchor positioning
                const anchor = options.anchor || "center";
                const padX = canvas.width - drawW;
                const padY = canvas.height - drawH;

                if (anchor.includes("west")) drawX = 0;
                else if (anchor.includes("east")) drawX = padX;
                else drawX = padX / 2; // center x

                if (anchor.includes("north")) drawY = 0;
                else if (anchor.includes("south")) drawY = padY;
                else drawY = padY / 2; // center y
            }

            ctx.drawImage(img, drawX, drawY, drawW, drawH);

            const outFormat = options.format === "original" ? (file.type as "image/jpeg" | "image/png" | "image/webp") : options.format;
            const finalFormat = ["image/jpeg", "image/png", "image/webp"].includes(outFormat) ? outFormat : "image/jpeg";

            canvas.toBlob(
                (blob) => {
                    if (blob) resolve(blob);
                    else reject(new Error("Canvas toBlob failed"));
                },
                finalFormat,
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
