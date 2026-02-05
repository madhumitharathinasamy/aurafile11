import { siteConfig } from "@/config/site";
import { Card } from "@/components/ui/Card";
import { Metadata } from "next";
import { Icon } from "@/components/ui/Icon";

export const metadata: Metadata = {
    title: "All Tools",
    description: "Browse our collection of free image tools.",
};

export default function ToolsPage() {
    return (
        <main className="container" style={{ padding: "4rem 1rem", maxWidth: "1280px" }}>
            <div style={{ textAlign: "center", marginBottom: "4rem" }}>
                <h1 style={{ fontSize: "3rem", fontWeight: 800, marginBottom: "1rem" }}>
                    Explore Our Tools
                </h1>
                <p style={{ fontSize: "1.25rem", color: "var(--text-secondary)", maxWidth: "600px", margin: "0 auto" }}>
                    Everything you need to process your images securely and efficiently.
                </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2rem" }}>
                {siteConfig.home.tools.items.map((tool) => (
                    <Card
                        key={tool.title}
                        title={tool.title}
                        description={tool.description}
                        href={tool.href}
                        icon={<Icon name={tool.icon} size={40} color="var(--primary)" />}
                    />
                ))}

                {/* Coming Soon Placeholders */}
                <div style={{ opacity: 0.6, pointerEvents: "none" }}>
                    <Card
                        title="AI Upscaler"
                        description="Enhance low-resolution images with AI. Coming Soon."
                        icon={<Icon name="zap" size={40} color="var(--text-muted)" />}
                    />
                </div>
                <div style={{ opacity: 0.6, pointerEvents: "none" }}>
                    <Card
                        title="Background Remover"
                        description="Remove backgrounds instantly. Coming Soon."
                        icon={<Icon name="image" size={40} color="var(--text-muted)" />}
                    />
                </div>
            </div>
        </main>
    );
}
