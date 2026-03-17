"use client";

import dynamic from "next/dynamic";
import { UploaderSkeleton } from "@/components/ui/UploaderSkeleton";

const CompressTool = dynamic(() => import("./CompressTool"), {
    ssr: false,
    loading: () => <UploaderSkeleton type="image" />
});

export function CompressToolLoader() {
    return <CompressTool />;
}
