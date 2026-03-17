"use client";

import dynamic from "next/dynamic";
import { UploaderSkeleton } from "@/components/ui/UploaderSkeleton";

const PdfToWordTool = dynamic(() => import("./PdfToWordTool"), {
    ssr: false,
    loading: () => <UploaderSkeleton type="pdf" />
});

export function PdfToWordToolLoader() {
    return <PdfToWordTool />;
}
