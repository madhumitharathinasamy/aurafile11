"use client";

import dynamic from "next/dynamic";
import { UploaderSkeleton } from "@/components/ui/UploaderSkeleton";

const RemoveBgTool = dynamic(() => import("./RemoveBgTool"), {
    ssr: false,
    loading: () => <UploaderSkeleton type="image" />
});

export function RemoveBgToolLoader() {
    return <RemoveBgTool />;
}
