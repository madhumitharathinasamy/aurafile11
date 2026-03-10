"use client";

import dynamic from "next/dynamic";
import { UploaderSkeleton } from "@/components/ui/UploaderSkeleton";

const CompressPdfTool = dynamic(() => import("./CompressPdfTool"), {
    ssr: false,
    loading: () => <UploaderSkeleton type="pdf" />
});

export function CompressPdfToolLoader() {
    return <CompressPdfTool />;
}
