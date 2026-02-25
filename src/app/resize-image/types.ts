export interface ResizeSettings {
    mode: "pixels" | "percentage" | "social";
    width: number | "";
    height: number | "";
    percentage: number;
    lockAspectRatio: boolean;
    preset: "ig-post" | "ig-story" | "fb-cover" | "tw-header" | "yt-thumb" | "li-banner" | "";
    format: "original" | "image/jpeg" | "image/png" | "image/webp";
    quality: number;
    resampling: "nearest" | "bilinear" | "bicubic" | "lanczos3";
    fillBackground: string;
    anchor: "center" | "north" | "northeast" | "east" | "southeast" | "south" | "southwest" | "west" | "northwest";
    preserveMetadata: boolean;
}


export interface FileWithMeta {
    id: string;
    file: File;
    previewUrl: string;
    originalWidth: number;
    originalHeight: number;
    settings: ResizeSettings;
}
