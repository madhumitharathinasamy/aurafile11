export type PdfToWordStatus = 'idle' | 'analyzing' | 'converting' | 'complete' | 'error';

export interface PdfFile {
    id: string;
    file: File;
    status: PdfToWordStatus;
    progress: number;
    error?: string;
    isScanned?: boolean;
    pageCount: number;
    resultUrl?: string; // Blob URL for DOCX

    // Settings specific to this file (for future per-file settings)
    settings?: {
        useOcr: boolean;
        pageRange?: string; // "1-5, 8"
    };
}
