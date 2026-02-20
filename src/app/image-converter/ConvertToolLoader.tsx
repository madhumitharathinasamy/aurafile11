"use client";

import dynamic from "next/dynamic";

const ConvertTool = dynamic(() => import("./ConvertTool"), {
    ssr: false,
    loading: () => <div className="h-[400px] w-full rounded-xl border border-dashed border-border bg-slate-50/50 animate-pulse" />
});

export function ConvertToolLoader() {
    return <ConvertTool />;
}
