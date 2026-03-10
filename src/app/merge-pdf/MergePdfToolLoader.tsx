"use client";

import dynamic from "next/dynamic";
import { UploaderSkeleton } from "@/components/ui/UploaderSkeleton";

const MergePdfTool = dynamic(() => import("./MergePdfTool"), {
    ssr: false,
    loading: () => <UploaderSkeleton type="pdf" />
});

export function MergePdfToolLoader() {
    return <MergePdfTool />;
}
