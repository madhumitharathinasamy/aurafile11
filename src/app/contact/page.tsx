import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = {
    title: "Contact Us | AuraFile",
    description:
        "Get in touch with the AuraFile team. We read every email and aim to respond within 2–3 business days.",
    alternates: {
        canonical: "https://aurafile.net/contact",
    },
};

export default function ContactPage() {
    return (
        <>
            <PageHeader
                title="Contact Us"
                subtitle="A real person reads every message. We typically respond within 2–3 business days."
            />

            <main className="container mx-auto px-4 pb-24 max-w-2xl animate-fade-in text-center">
                <div className="rounded-xl border border-foreground/10 bg-foreground/5 p-12">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#00B4D8]/10 text-[#00B4D8] mb-6 text-3xl">
                        📧
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-4">
                        Email Us Directly
                    </h2>
                    <p className="text-base text-foreground/70 mb-8 max-w-md mx-auto leading-relaxed">
                        Whether you have a feature request, found a bug, or just want to ask a question, we&apos;re here to help. Reach out to us at:
                    </p>
                    <a
                        href="mailto:team@aurafile.net"
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#00B4D8] px-8 py-4 text-base font-semibold text-white hover:bg-[#0096b7] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#00B4D8]/50 break-all shadow-sm"
                    >
                        team@aurafile.net
                    </a>
                    
                    <p className="text-sm text-foreground/50 mt-10">
                        🔒 We use your email strictly to respond to your inquiry and do not add you to any marketing lists.
                    </p>
                </div>
            </main>
        </>
    );
}
