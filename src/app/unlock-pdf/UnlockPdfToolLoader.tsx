"use client";

import dynamic from "next/dynamic";
import { UploaderSkeleton } from "@/components/ui/UploaderSkeleton";

const UnlockPdfTool = dynamic(() => import("./UnlockPdfTool"), {
    ssr: false,
    loading: () => <UploaderSkeleton type="pdf" />
});

export function UnlockPdfToolLoader() {
    return <UnlockPdfTool />;
}
