"use client";

import dynamic from "next/dynamic";
import { UploaderSkeleton } from "@/components/ui/UploaderSkeleton";

const CropTool = dynamic(() => import("./CropTool"), {
    ssr: false,
    loading: () => <UploaderSkeleton type="image" />
});

export function CropToolLoader() {
    return <CropTool />;
}
