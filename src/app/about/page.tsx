import type { Metadata } from "next";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
    title: "About Us | AuraFile — Privacy-First Browser-Based File Tools",
    description:
        "Learn about AuraFile and the developer behind it. Built by a web developer passionate about privacy-first tools that process files 100% in your browser — no uploads, no accounts, no compromise.",
    alternates: {
        canonical: "https://aurafile.net/about",
    },
};

const VALUES = [
    {
        icon: "shield" as const,
        title: "Privacy by Architecture",
        description:
            "We didn't add privacy as a feature — we built from the ground up so your files never leave your device. Client-side processing is a fundamental technical choice, not a marketing claim.",
    },
    {
        icon: "zap" as const,
        title: "Speed Without Trade-Offs",
        description:
            "No upload queues, no server wait times. Your files are processed instantly by your own device's CPU — results in seconds, not minutes.",
    },
    {
        icon: "code" as const,
        title: "Built to Web Standards",
        description:
            "AuraFile uses modern browser technologies like WebAssembly, the File System API, and the Canvas API — reliable, open standards that work across all modern devices.",
    },
    {
        icon: "heart" as const,
        title: "Free & Accessible",
        description:
            "Every tool on AuraFile is free to use without an account. We believe powerful file processing shouldn't require a subscription or compromise on privacy.",
    },
];

const TOOLS_BUILT = [
    "PDF Merge, Split, Compress & Convert",
    "Image Format Conversion (JPG, PNG, WebP, HEIC, TIFF)",
    "Image Compression & Batch Resize",
    "AI Background Removal",
    "Optical Character Recognition (OCR)",
    "Image Cropping & Rotation",
    "PDF to Image & Image to PDF",
    "DOCX to PDF Conversion",
];

export default function AboutPage() {
    return (
        <main className="container mx-auto max-w-4xl px-4 py-16 md:py-24 animate-fade-in">

            {/* ── Hero ── */}
            <div className="text-center mb-16">
                <h1 className="mb-4 text-[#00B4D8] font-extrabold text-4xl md:text-5xl tracking-tight">
                    About AuraFile
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                    A privacy-first suite of browser-based file tools — built by a developer who
                    believes your files should never have to leave your device.
                </p>
            </div>

            <div className="space-y-20 text-foreground/90">

                {/* ── Who We Are ── */}
                <section>
                    <h2 className="mb-5 text-2xl md:text-3xl font-bold text-foreground">
                        Who We Are
                    </h2>
                    <div className="space-y-4 text-foreground/80 leading-relaxed">
                        <p>
                            AuraFile is built and maintained by a{" "}
                            <strong>independent web developer</strong> with a focus on creating
                            practical, privacy-respecting tools for everyday tasks. The project
                            started out of a simple frustration: nearly every online file tool
                            requires you to upload your files to a third-party server — often with
                            no transparency about what happens to them afterward.
                        </p>
                        <p>
                            The answer was to build differently. AuraFile processes everything{" "}
                            <strong>100% in your browser</strong>, using modern web technologies
                            like WebAssembly, the Canvas API, and client-side JavaScript libraries.
                            Your files never leave your device — not because of a policy, but
                            because of how the software is architected.
                        </p>
                        <p>
                            As a developer, this project represents real hands-on experience
                            working with complex browser APIs, PDF processing libraries (pdf-lib),
                            image manipulation (Jimp, Sharp), machine learning in the browser
                            (@imgly/background-removal), and OCR (Tesseract.js). Every tool is
                            carefully built and tested to ensure it works reliably across devices
                            and browsers.
                        </p>
                    </div>
                </section>

                {/* ── E-E-A-T: Experience & Expertise ── */}
                <section>
                    <h2 className="mb-5 text-2xl md:text-3xl font-bold text-foreground">
                        Experience &amp; Expertise Behind the Tools
                    </h2>
                    <div className="space-y-4 text-foreground/80 leading-relaxed">
                        <p>
                            AuraFile isn&apos;t a template or a reseller of third-party APIs. Every
                            tool is researched, designed, and implemented from scratch with a focus
                            on correctness and real-world usability. Here&apos;s what that looks like
                            in practice:
                        </p>
                        <ul className="space-y-3 pl-0 list-none">
                            <li className="flex items-start gap-3">
                                <span className="text-[#00B4D8] mt-1 shrink-0">▸</span>
                                <span>
                                    <strong>PDF tools</strong> are built on{" "}
                                    <code className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-sm font-mono">
                                        pdf-lib
                                    </code>{" "}
                                    and{" "}
                                    <code className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-sm font-mono">
                                        pdfjs-dist
                                    </code>
                                    , supporting operations like merge, split, compress, rotation,
                                    and password-protected files — all handled client-side.
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-[#00B4D8] mt-1 shrink-0">▸</span>
                                <span>
                                    <strong>Image tools</strong> handle a wide range of formats
                                    including HEIC (iPhone photos), TIFF, WebP, and RAW-adjacent
                                    formats using libraries like{" "}
                                    <code className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-sm font-mono">
                                        heic2any
                                    </code>{" "}
                                    and{" "}
                                    <code className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-sm font-mono">
                                        jimp
                                    </code>
                                    , with compression tuned for optimal file-size-to-quality
                                    ratios.
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-[#00B4D8] mt-1 shrink-0">▸</span>
                                <span>
                                    <strong>AI Background Removal</strong> runs a full machine
                                    learning model directly in the browser — no image is ever sent
                                    to a cloud API. The model loads locally and runs on your
                                    device&apos;s hardware.
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-[#00B4D8] mt-1 shrink-0">▸</span>
                                <span>
                                    <strong>OCR</strong> uses Tesseract.js to extract text from
                                    images and scanned PDFs, supporting multiple languages — again,
                                    entirely in-browser.
                                </span>
                            </li>
                        </ul>
                        <p>
                            This level of technical depth reflects genuine expertise in web
                            development, browser APIs, and file processing — not surface-level
                            integrations.
                        </p>
                    </div>

                    {/* Tool grid */}
                    <div className="mt-8">
                        <h3 className="text-base font-semibold text-foreground mb-4">
                            Tools Built &amp; Maintained:
                        </h3>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {TOOLS_BUILT.map((tool) => (
                                <li
                                    key={tool}
                                    className="flex items-center gap-2 text-sm text-foreground/70 bg-foreground/5 rounded-lg px-3 py-2"
                                >
                                    <Icon name="check-circle" size={15} className="text-[#00B4D8] shrink-0" />
                                    {tool}
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                {/* ── Our Mission / Values ── */}
                <section>
                    <h2 className="mb-5 text-2xl md:text-3xl font-bold text-foreground">
                        Our Mission &amp; Values
                    </h2>
                    <p className="text-foreground/80 leading-relaxed mb-8">
                        Simple tasks like converting a PDF or compressing an image shouldn&apos;t
                        require handing your files to a corporation. AuraFile was built on the
                        belief that powerful tools and strong privacy are not mutually exclusive.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {VALUES.map((v) => (
                            <div
                                key={v.title}
                                className="rounded-xl border border-foreground/10 bg-foreground/5 p-5 space-y-2"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-[#00B4D8]">
                                        <Icon name={v.icon} size={20} />
                                    </span>
                                    <h3 className="font-semibold text-foreground text-base">
                                        {v.title}
                                    </h3>
                                </div>
                                <p className="text-sm text-foreground/70 leading-relaxed">
                                    {v.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── Why Trust Us (Authoritativeness & Trust) ── */}
                <section>
                    <h2 className="mb-5 text-2xl md:text-3xl font-bold text-foreground">
                        Why You Can Trust AuraFile
                    </h2>
                    <div className="space-y-4 text-foreground/80 leading-relaxed">
                        <p>
                            Trust shouldn&apos;t be based on promises alone — it should be
                            verifiable. Here&apos;s why AuraFile is trustworthy by design:
                        </p>
                        <div className="space-y-4">
                            <div className="flex items-start gap-4 p-4 rounded-xl border border-foreground/10 bg-foreground/5">
                                <span className="text-2xl mt-0.5">🔒</span>
                                <div>
                                    <h3 className="font-semibold text-foreground mb-1">
                                        Technically Impossible to Steal Your Files
                                    </h3>
                                    <p className="text-sm text-foreground/70">
                                        Because all processing happens in your browser, AuraFile&apos;s
                                        servers never receive your files. This isn&apos;t a policy we
                                        could break — it&apos;s a technical reality. You can verify
                                        this yourself by disconnecting from the internet after the
                                        page loads: the tools still work.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 p-4 rounded-xl border border-foreground/10 bg-foreground/5">
                                <span className="text-2xl mt-0.5">📄</span>
                                <div>
                                    <h3 className="font-semibold text-foreground mb-1">
                                        Transparent Policies
                                    </h3>
                                    <p className="text-sm text-foreground/70">
                                        Our{" "}
                                        <a
                                            href="/privacy-policy"
                                            className="text-[#00B4D8] hover:underline"
                                        >
                                            Privacy Policy
                                        </a>{" "}
                                        and{" "}
                                        <a
                                            href="/terms-of-service"
                                            className="text-[#00B4D8] hover:underline"
                                        >
                                            Terms of Service
                                        </a>{" "}
                                        are written in plain language. We disclose every third-party
                                        service we use (Google Analytics, Vercel Analytics) and
                                        explain exactly what data they collect and why.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 p-4 rounded-xl border border-foreground/10 bg-foreground/5">
                                <span className="text-2xl mt-0.5">🚫</span>
                                <div>
                                    <h3 className="font-semibold text-foreground mb-1">
                                        No Account, No Tracking of You
                                    </h3>
                                    <p className="text-sm text-foreground/70">
                                        AuraFile requires no registration and stores no personal
                                        profile. Analytics data we collect is anonymized and
                                        aggregated — we can see that &quot;X users visited the PDF
                                        compressor&quot; but never who you are or what file you
                                        processed.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 p-4 rounded-xl border border-foreground/10 bg-foreground/5">
                                <span className="text-2xl mt-0.5">⚙️</span>
                                <div>
                                    <h3 className="font-semibold text-foreground mb-1">
                                        Open Technologies, Not Black Boxes
                                    </h3>
                                    <p className="text-sm text-foreground/70">
                                        Every library AuraFile uses — pdf-lib, Tesseract.js,
                                        heic2any, and others — is open-source and publicly auditable.
                                        There are no proprietary black-box processing pipelines.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Technology ── */}
                <section>
                    <h2 className="mb-5 text-2xl md:text-3xl font-bold text-foreground">
                        The Technology
                    </h2>
                    <p className="text-foreground/80 leading-relaxed mb-6">
                        AuraFile is a{" "}
                        <strong>Next.js application</strong> built with TypeScript, React, and
                        Tailwind CSS, deployed on Vercel for global low-latency access. The
                        browser-side processing relies on a carefully curated set of open-source
                        libraries chosen for reliability, functionality, and active maintenance.
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                        {[
                            { label: "Framework", value: "Next.js 15 + React 19" },
                            { label: "Language", value: "TypeScript" },
                            { label: "Styling", value: "Tailwind CSS" },
                            { label: "PDF Engine", value: "pdf-lib / pdfjs-dist" },
                            { label: "Image Engine", value: "Jimp / Sharp" },
                            { label: "AI / ML", value: "@imgly/background-removal" },
                            { label: "OCR", value: "Tesseract.js" },
                            { label: "Hosting", value: "Vercel Edge Network" },
                            { label: "Analytics", value: "Vercel Analytics" },
                        ].map(({ label, value }) => (
                            <div
                                key={label}
                                className="rounded-lg border border-foreground/10 bg-foreground/5 p-3"
                            >
                                <p className="text-xs text-foreground/50 mb-1">{label}</p>
                                <p className="font-medium text-foreground/80">{value}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── Contact ── */}
                <section className="bg-surface border border-border rounded-2xl p-8 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-6">
                        <Icon name="mail" size={24} />
                    </div>
                    <h2 className="mb-3 text-xl md:text-2xl font-bold text-foreground">
                        Get in Touch
                    </h2>
                    <p className="text-muted-foreground mb-2 max-w-md mx-auto">
                        Have feedback, a feature request, found a bug, or just want to say hi?
                        We read every email.
                    </p>
                    <p className="text-muted-foreground mb-8 max-w-md mx-auto text-sm">
                        We typically respond within <strong>2–3 business days</strong>.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                        <Button
                            href="mailto:team@aurafile.net"
                            variant="primary"
                            className="w-full sm:w-auto flex items-center gap-2"
                        >
                            <Icon name="mail" size={18} />
                            team@aurafile.net
                        </Button>
                    </div>
                </section>
            </div>
        </main>
    );
}
