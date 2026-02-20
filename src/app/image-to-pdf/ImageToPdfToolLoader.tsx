"use client";

import dynamic from "next/dynamic";

const ImageToPdfTool = dynamic(() => import("./ImageToPdfTool"), {
    ssr: false,
    loading: () => <div className="h-[400px] w-full rounded-xl border border-dashed border-border bg-slate-50/50 animate-pulse" />
});

export function ImageToPdfToolLoader() {
    return <ImageToPdfTool />;
}
