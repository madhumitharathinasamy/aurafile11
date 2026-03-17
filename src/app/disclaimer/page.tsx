import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Disclaimer | AuraFile",
    description:
        "AuraFile's Disclaimer. Our tools are provided 'as-is'. AuraFile is an independent project and is not affiliated with Adobe, Microsoft, Google, or any other software company.",
    alternates: {
        canonical: "https://aurafile.net/disclaimer",
    },
};

export default function DisclaimerPage() {
    const lastUpdated = "March 2026";

    return (
        <main className="container mx-auto max-w-4xl px-4 py-16 animate-fade-in">

            {/* Header */}
            <div className="text-center mb-12">
                <h1 className="mb-4 text-[#00B4D8] font-extrabold text-4xl md:text-5xl tracking-tight">
                    Disclaimer
                </h1>
                <p className="text-foreground/60 text-sm">Last Updated: {lastUpdated}</p>
                <p className="mt-4 text-foreground/70 max-w-2xl mx-auto">
                    By using AuraFile, you acknowledge and accept the following disclaimers. Please
                    read them carefully.
                </p>
            </div>

            <div className="space-y-10 text-foreground/80 text-sm leading-relaxed">

                {/* 1 — As-Is */}
                <section id="as-is" className="scroll-mt-20">
                    <h2 className="text-xl font-bold text-foreground mb-4 pb-2 border-b border-foreground/10">
                        1. &ldquo;As-Is&rdquo; Service
                    </h2>
                    <p className="mb-3">
                        All tools provided on AuraFile (&ldquo;the Service&rdquo;) are offered on
                        an <strong>&ldquo;as-is&rdquo; and &ldquo;as-available&rdquo; basis</strong>,
                        without warranties of any kind — express, implied, or statutory.
                    </p>
                    <p className="mb-3">
                        We make no representations or guarantees regarding:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mb-3">
                        <li>The <strong>accuracy, completeness, or quality</strong> of tool output (e.g., OCR text extraction, compression ratios, AI background removal results).</li>
                        <li>The <strong>fitness for a particular purpose</strong> of any tool — results may vary based on file type, size, and browser environment.</li>
                        <li>The <strong>uninterrupted or error-free availability</strong> of the Service at all times.</li>
                        <li>Compatibility with all file formats, encodings, or browser versions.</li>
                    </ul>
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mt-4">
                        <p className="font-semibold text-amber-400 mb-1">⚠ Always Keep a Backup</p>
                        <p className="text-xs">
                            We strongly recommend keeping the original copy of any file before
                            processing it with AuraFile. AuraFile is not responsible for any file
                            loss, corruption, or unintended changes.
                        </p>
                    </div>
                </section>

                {/* 2 — No Affiliation */}
                <section id="no-affiliation" className="scroll-mt-20">
                    <h2 className="text-xl font-bold text-foreground mb-4 pb-2 border-b border-foreground/10">
                        2. No Affiliation with Third-Party Brands
                    </h2>
                    <p className="mb-4">
                        <strong>AuraFile is an independent project</strong> and is{" "}
                        <strong>not affiliated with, endorsed by, sponsored by, or in any way
                        connected to</strong> any of the following companies or their products:
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
                        {[
                            { name: "Adobe", example: "Acrobat, Photoshop, Illustrator" },
                            { name: "Microsoft", example: "Word, Excel, OneDrive" },
                            { name: "Google", example: "Drive, Docs, Photos" },
                            { name: "Apple", example: "Preview, iCloud" },
                            { name: "Foxit", example: "Foxit PDF Editor" },
                            { name: "WinZip / WinRAR", example: "Compression tools" },
                            { name: "Canva", example: "Canva Design" },
                            { name: "iLovePDF", example: "Online PDF tools" },
                            { name: "Smallpdf", example: "Online PDF tools" },
                        ].map(({ name, example }) => (
                            <div
                                key={name}
                                className="rounded-lg border border-foreground/10 bg-foreground/5 p-3"
                            >
                                <p className="font-semibold text-foreground text-xs">{name}</p>
                                <p className="text-xs text-foreground/50 mt-0.5">{example}</p>
                            </div>
                        ))}
                    </div>
                    <p className="mb-3">
                        Any references to third-party product names, file formats (e.g., PDF, DOCX,
                        PSD), or standards on AuraFile are made solely for descriptive purposes —
                        to indicate compatibility or functionality — and do not imply any affiliation
                        or endorsement.
                    </p>
                    <p>
                        All trademarks, service marks, and trade names referenced on AuraFile are
                        the property of their respective owners.
                    </p>
                </section>

                {/* 3 — No Rights to Output */}
                <section id="output" className="scroll-mt-20">
                    <h2 className="text-xl font-bold text-foreground mb-4 pb-2 border-b border-foreground/10">
                        3. Ownership of Output
                    </h2>
                    <p>
                        AuraFile claims no ownership over files you upload or process. Your input
                        files and all output files remain under your ownership and control at all
                        times. Because all processing occurs client-side in your browser, AuraFile
                        never has access to, receives, or stores any of your files.
                    </p>
                </section>

                {/* 4 — Limitation of Liability */}
                <section id="liability" className="scroll-mt-20">
                    <h2 className="text-xl font-bold text-foreground mb-4 pb-2 border-b border-foreground/10">
                        4. Limitation of Liability
                    </h2>
                    <p className="mb-3">
                        To the maximum extent permitted by law, AuraFile and its operators shall
                        not be liable for any direct, indirect, incidental, consequential, or
                        punitive damages arising from:
                    </p>
                    <ul className="list-disc pl-6 space-y-1 mb-3">
                        <li>Use of or inability to use any tool on the Service.</li>
                        <li>Loss, corruption, or damage to files processed through the Service.</li>
                        <li>Inaccurate, incomplete, or unexpected output from any tool.</li>
                        <li>Interruption or unavailability of the Service.</li>
                        <li>Any reliance placed on the output produced by AuraFile&apos;s tools.</li>
                    </ul>
                    <p>
                        For more details, see our full{" "}
                        <a href="/terms-of-service" className="text-[#00B4D8] hover:underline">
                            Terms of Service
                        </a>
                        .
                    </p>
                </section>

                {/* 5 — External Links */}
                <section id="external-links" className="scroll-mt-20">
                    <h2 className="text-xl font-bold text-foreground mb-4 pb-2 border-b border-foreground/10">
                        5. External Links
                    </h2>
                    <p>
                        AuraFile may contain links to external websites (such as documentation,
                        open-source libraries, or referenced tools). These links are provided for
                        convenience only. We have no control over the content, privacy practices,
                        or accuracy of external sites and accept no responsibility for them. The
                        inclusion of any external link does not constitute an endorsement by
                        AuraFile.
                    </p>
                </section>

                {/* 6 — Changes */}
                <section id="changes" className="scroll-mt-20">
                    <h2 className="text-xl font-bold text-foreground mb-4 pb-2 border-b border-foreground/10">
                        6. Changes to This Disclaimer
                    </h2>
                    <p>
                        We reserve the right to update or revise this Disclaimer at any time. The
                        &ldquo;Last Updated&rdquo; date at the top of this page will reflect the
                        most recent revision. Continued use of AuraFile after changes are published
                        constitutes your acceptance of the updated Disclaimer.
                    </p>
                </section>

                {/* 7 — Contact */}
                <section id="contact" className="scroll-mt-20">
                    <h2 className="text-xl font-bold text-foreground mb-4 pb-2 border-b border-foreground/10">
                        7. Contact
                    </h2>
                    <p>
                        If you have any questions about this Disclaimer, please contact us at{" "}
                        <a
                            href="mailto:team@aurafile.net"
                            className="text-[#00B4D8] hover:underline"
                        >
                            team@aurafile.net
                        </a>
                        .
                    </p>
                </section>
            </div>

            {/* Footer note */}
            <div className="mt-16 pt-8 border-t border-foreground/10 text-center text-xs text-foreground/50">
                <p>
                    This Disclaimer is effective as of {lastUpdated} and applies to all users of{" "}
                    <a href="https://aurafile.net" className="text-[#00B4D8] hover:underline">
                        aurafile.net
                    </a>
                    .
                </p>
                <div className="flex justify-center gap-6 mt-3 text-[#00B4D8]">
                    <a href="/privacy-policy" className="hover:underline">Privacy Policy</a>
                    <a href="/terms-of-service" className="hover:underline">Terms of Service</a>
                    <a href="/contact" className="hover:underline">Contact Us</a>
                </div>
            </div>
        </main>
    );
}
