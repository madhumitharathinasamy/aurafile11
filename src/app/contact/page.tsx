import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = {
    title: "Contact Us",
    description: "Get in touch with the Aura File team for support.",
};

export default function ContactPage() {
    return (
        <>
            <PageHeader
                title="Contact Us"
                subtitle="Have questions, suggestions, or need help? We're here to assist you."
            />

            <main className="container" style={{ paddingBottom: "6rem", maxWidth: "800px" }}>
                <div style={{
                    padding: "3rem",
                    background: "var(--surface)",
                    borderRadius: "var(--radius-lg)",
                    border: "1px solid var(--border)",
                    textAlign: "center"
                }}>
                    <h2 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                        <span>📧</span> Email Support
                    </h2>
                    <p style={{ color: "var(--text-secondary)", marginBottom: "2rem", lineHeight: "1.6", maxWidth: "480px", margin: "0 auto 2rem" }}>
                        For all inquiries, please email us directly. We aim to respond within 24 hours.
                    </p>

                    <a href="mailto:support@aurafile.net" style={{ textDecoration: "none" }}>
                        <Button variant="primary">
                            support@aurafile.net
                        </Button>
                    </a>
                </div>
            </main>
        </>
    );
}
