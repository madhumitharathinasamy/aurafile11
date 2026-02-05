import Link from "next/link";
import { siteConfig } from "@/config/site";

export default function ToolsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="container mx-auto px-4 pb-16 min-h-[80vh]">
            {/* Back link removed as per user request */}
            {children}
        </div>
    );
}
