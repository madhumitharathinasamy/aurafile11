"use client";

import dynamic from "next/dynamic";
import { UploaderSkeleton } from "@/components/ui/UploaderSkeleton";

const ProtectPdfTool = dynamic(() => import("./ProtectPdfTool"), {
    ssr: false,
    loading: () => <UploaderSkeleton type="pdf" />
});

export function ProtectPdfToolLoader() {
    return <ProtectPdfTool />;
}
