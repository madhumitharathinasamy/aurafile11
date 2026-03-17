"use client";

import dynamic from "next/dynamic";
import { UploaderSkeleton } from "@/components/ui/UploaderSkeleton";

const ConvertTool = dynamic(() => import("./ConvertTool"), {
    ssr: false,
    loading: () => <UploaderSkeleton type="image" />
});

export function ConvertToolLoader() {
    return <ConvertTool />;
}
