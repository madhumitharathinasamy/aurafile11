"use client";

import dynamic from "next/dynamic";
import { UploaderSkeleton } from "@/components/ui/UploaderSkeleton";

const CompressDynamicTool = dynamic(() => import("./CompressDynamicTool"), {
    ssr: false,
    loading: () => <UploaderSkeleton type="image" />
});

interface CompressDynamicToolLoaderProps {
    defaultTargetSize?: string;
}

export function CompressDynamicToolLoader({ defaultTargetSize }: CompressDynamicToolLoaderProps) {
    return <CompressDynamicTool defaultTargetSize={defaultTargetSize} />;
}
