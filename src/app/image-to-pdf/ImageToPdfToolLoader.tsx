"use client";

import dynamic from "next/dynamic";
import { UploaderSkeleton } from "@/components/ui/UploaderSkeleton";

const ImageToPdfTool = dynamic(() => import("./ImageToPdfTool"), {
    ssr: false,
    loading: () => <UploaderSkeleton type="image" />
});

export function ImageToPdfToolLoader() {
    return <ImageToPdfTool />;
}
