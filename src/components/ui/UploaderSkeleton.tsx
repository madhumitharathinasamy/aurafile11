import { Icon } from "@/components/ui/Icon";
import { UPLOAD_LIMITS } from "@/config/limits";

interface UploaderSkeletonProps {
    type: 'pdf' | 'image';
}

export function UploaderSkeleton({ type }: UploaderSkeletonProps) {
    if (type === 'pdf') {
        return (
            <div className="w-full space-y-8 animate-pulse">
                <div className="mt-6 w-full max-w-7xl mx-auto">
                    <div className="rounded-xl border border-border bg-white shadow-xl p-4 md:p-8">

                        {/* PdfUploader Mock */}
                        <div className="rounded-xl border-2 border-dashed p-8 text-center border-border bg-surface">
                            <div className="flex flex-col items-center gap-4">
                                <div className="mb-2 rounded-full bg-primary/10 p-4 shadow-sm">
                                    <Icon name="file-text" size={48} className="text-primary/50" />
                                </div>
                                <p className="text-foreground/70">
                                    Loading uploader...
                                </p>
                                <p className="text-muted-foreground/50">Supports up to {UPLOAD_LIMITS.MAX_FILES} PDFs (Max {UPLOAD_LIMITS.MAX_FILE_SIZE_MB}MB)</p>
                            </div>
                        </div>

                        {/* Security Badge Mock */}
                        <div className="mt-8 rounded-xl bg-[#0081C9]/5 p-4 text-sm border border-[#0081C9]/10 flex gap-3 mx-auto max-w-2xl">
                            <div className="w-5 h-5 bg-[#0081C9]/20 rounded-full shrink-0"></div>
                            <div className="space-y-2 w-full pt-1">
                                <div className="h-3.5 w-full max-w-md bg-[#0081C9]/20 rounded"></div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full space-y-8 animate-pulse">
            <div className="mt-6 w-full max-w-7xl mx-auto">
                <div className="rounded-xl border border-border bg-white shadow-xl p-4 md:p-8">

                    {/* ImageUploader Mock */}
                    <div className="w-full max-w-4xl mx-auto">
                        <div className="relative flex flex-col items-center justify-center gap-4 p-12 rounded-xl border-2 border-dashed border-border bg-surface">
                            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-muted text-muted-foreground/50">
                                <Icon name="upload" size={28} />
                            </div>
                            <div className="text-center">
                                <p className="text-foreground/70">Loading uploader...</p>
                            </div>
                            <p className="text-muted-foreground/50">
                                Supports JPG, PNG, WEBP, GIF • Max {UPLOAD_LIMITS.MAX_FILE_SIZE_MB}MB • Up to {UPLOAD_LIMITS.MAX_FILES} files
                            </p>
                        </div>
                    </div>

                    {/* Security Badge Mock */}
                    <div className="mt-8 rounded-xl bg-[#0081C9]/5 p-4 text-sm border border-[#0081C9]/10 flex gap-3 mx-auto max-w-2xl">
                        <div className="w-5 h-5 bg-[#0081C9]/20 rounded-full shrink-0"></div>
                        <div className="space-y-2 w-full pt-1">
                            <div className="h-3.5 w-full max-w-md bg-[#0081C9]/20 rounded"></div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
