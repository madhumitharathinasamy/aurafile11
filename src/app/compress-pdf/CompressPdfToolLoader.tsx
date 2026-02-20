"use client";

import dynamic from "next/dynamic";

const CompressPdfTool = dynamic(() => import("./CompressPdfTool"), {
    ssr: false,
    loading: () => <div className="h-[400px] w-full rounded-xl border border-dashed border-border bg-slate-50/50 animate-pulse" />
});

export function CompressPdfToolLoader() {
    return <CompressPdfTool />;
}
