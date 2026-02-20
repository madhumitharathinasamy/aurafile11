export interface ResizeSettings {
    mode: "pixels" | "percentage" | "social";
    width: number | "";
    height: number | "";
    percentage: number;
    lockAspectRatio: boolean;
    preset: "ig-post" | "ig-story" | "fb-cover" | "tw-header" | "yt-thumb" | "li-banner" | "";
    format: "original" | "image/jpeg" | "image/png" | "image/webp";
    quality: number;
}

export interface FileWithMeta {
    id: string;
    file: File;
    previewUrl: string;
    originalWidth: number;
    originalHeight: number;
    settings: ResizeSettings;
}
