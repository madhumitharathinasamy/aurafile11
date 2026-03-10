"use client";

import dynamic from "next/dynamic";
import { UploaderSkeleton } from "@/components/ui/UploaderSkeleton";

const ResizeTool = dynamic(() => import("./ResizeTool"), {
    ssr: false,
    loading: () => <UploaderSkeleton type="image" />
});

export function ResizeToolLoader() {
    return <ResizeTool />;
}
