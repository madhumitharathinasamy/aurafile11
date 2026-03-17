import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terms of Service | AuraFile",
    description:
        "Read AuraFile's Terms of Service. Understand the rules for using our free browser-based file tools, acceptable use policy, and our disclaimer regarding file loss.",
    alternates: {
        canonical: "https://aurafile.net/terms-of-service",
    },
};

const SECTIONS = [
    {
        id: "acceptance",
        number: "1",
        title: "Acceptance of Terms",
        content: (
            <p>
                By accessing or using AuraFile, available at{" "}
                <a href="https://aurafile.net" className="text-[#00B4D8] hover:underline">
                    https://aurafile.net
                </a>{" "}
                (&quot;the Service&quot;, &quot;we&quot;, &quot;our&quot;, or
                &quot;AuraFile&quot;), you (&quot;User&quot;, &quot;you&quot;) agree to be legally
                bound by these Terms of Service (&quot;Terms&quot;). If you do not agree with any
                part of these Terms, you must immediately stop using the Service. These Terms apply
                to all visitors, users, and others who access or use AuraFile.
            </p>
        ),
    },
    {
        id: "description",
        number: "2",
        title: "Description of Service",
        content: (
            <>
                <p className="mb-3">
                    AuraFile provides a suite of free, browser-based file processing tools
                    including, but not limited to:
                </p>
                <ul className="list-disc pl-6 space-y-1 mb-4">
                    <li>PDF editing, merging, splitting, compressing, and converting</li>
                    <li>Image conversion, compression, resizing, and format conversion</li>
                    <li>Background removal and image enhancement</li>
                    <li>Optical Character Recognition (OCR)</li>
                    <li>File format conversion (HEIC, TIFF, WebP, DOCX, and more)</li>
                </ul>
                <p>
                    All tools operate <strong>entirely within your web browser</strong> (client-side
                    processing). We do not upload, store, or transmit your files to any server. The
                    Service is provided free of charge and is funded by advertising.
                </p>
            </>
        ),
    },
    {
        id: "acceptable-use",
        number: "3",
        title: "Acceptable Use",
        content: (
            <>
                <p className="mb-3">
                    You agree to use AuraFile only for lawful purposes and in a manner that does not
                    infringe the rights of others or restrict or inhibit their use of the Service.
                </p>
                <h3 className="font-semibold text-foreground mt-4 mb-2">3.1 You May Use AuraFile To:</h3>
                <ul className="list-disc pl-6 space-y-1 mb-4">
                    <li>Process files you own or have explicit legal permission to process.</li>
                    <li>Convert, compress, or edit files for personal, educational, or commercial use.</li>
                    <li>Use the tools as part of a legitimate workflow or business process.</li>
                </ul>
                <h3 className="font-semibold text-foreground mt-4 mb-2">3.2 Prohibited Uses</h3>
                <p className="mb-2">
                    You <strong>must not</strong> use AuraFile to process, create, distribute, or
                    engage with files or content that:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>
                        <strong>Is illegal</strong> under any applicable local, national, or
                        international law — including files related to fraud, hacking, or criminal
                        activity.
                    </li>
                    <li>
                        <strong>Contains child sexual abuse material (CSAM)</strong> or any content
                        that exploits or harms minors. Violations will be reported to relevant
                        authorities.
                    </li>
                    <li>
                        <strong>Infringes intellectual property rights</strong> — including
                        copyrighted material you do not own or have permission to use.
                    </li>
                    <li>
                        <strong>Contains malware, viruses, or malicious code</strong> intended to
                        harm systems, networks, or users.
                    </li>
                    <li>
                        <strong>Is used to facilitate piracy</strong>, including distributing
                        software, movies, music, or publications without authorization.
                    </li>
                    <li>
                        <strong>Constitutes harassment, hate speech, or threats</strong> targeting
                        individuals or groups based on race, religion, gender, nationality, or other
                        protected characteristics.
                    </li>
                    <li>
                        <strong>Involves deceptive, fraudulent, or misleading content</strong>,
                        including the creation of forged documents or deepfakes intended to deceive.
                    </li>
                    <li>
                        <strong>Is used to scrape, crawl, or automate requests</strong> to AuraFile
                        in a way that overloads or damages the Service.
                    </li>
                    <li>
                        <strong>Circumvents or interferes</strong> with any security features,
                        access controls, or technical measures used by AuraFile.
                    </li>
                </ul>
                <p className="mt-4 text-sm bg-foreground/5 rounded-lg p-3">
                    <strong>Note:</strong> Since all processing occurs in your browser and files are
                    never uploaded to our servers, AuraFile does not technically review the content
                    of your files. You bear full legal responsibility for ensuring that your use of
                    AuraFile — and the content of files you process — complies with all applicable
                    laws and these Terms.
                </p>
            </>
        ),
    },
    {
        id: "intellectual-property",
        number: "4",
        title: "Intellectual Property",
        content: (
            <>
                <p className="mb-3">
                    The AuraFile website, including its design, logo, branding, source code,
                    written content, and tool implementations, is the intellectual property of
                    AuraFile and is protected by applicable copyright, trademark, and other
                    intellectual property laws.
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>
                        You are granted a limited, non-exclusive, non-transferable license to use
                        the Service for your own personal or commercial file processing needs.
                    </li>
                    <li>
                        You may not copy, reproduce, modify, distribute, or create derivative works
                        from AuraFile&apos;s website or source code without prior written consent.
                    </li>
                    <li>
                        <strong>Your files remain your property.</strong> AuraFile does not claim
                        any ownership over the files you process. We do not access or store them.
                    </li>
                    <li>
                        You represent and warrant that you have all necessary rights, licenses, and
                        permissions to process any file you submit through AuraFile.
                    </li>
                </ul>
            </>
        ),
    },
    {
        id: "disclaimer-warranty",
        number: "5",
        title: 'Disclaimer of Warranties ("As Is" Service)',
        content: (
            <>
                <p className="mb-3">
                    <strong>
                        AuraFile is provided on an &quot;as is&quot; and &quot;as available&quot;
                        basis without any warranties of any kind.
                    </strong>{" "}
                    To the fullest extent permitted by law, we expressly disclaim all warranties,
                    whether express, implied, or statutory, including but not limited to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Implied warranties of merchantability or fitness for a particular purpose.</li>
                    <li>Warranties that the Service will be uninterrupted, error-free, or secure.</li>
                    <li>
                        Warranties regarding the accuracy, reliability, or completeness of output
                        produced by any of our tools (e.g., OCR results, compression quality, format
                        conversion fidelity).
                    </li>
                    <li>
                        Warranties that the Service will meet your specific requirements or
                        expectations.
                    </li>
                </ul>
                <p className="mt-4">
                    You acknowledge that browser-based processing depends on your device&apos;s
                    hardware, operating system, and browser version, and results may vary.
                </p>
            </>
        ),
    },
    {
        id: "file-loss-disclaimer",
        number: "6",
        title: "File Loss & Data Disclaimer",
        content: (
            <>
                <p className="mb-3">
                    <strong>
                        AuraFile is not responsible for any loss, corruption, or damage to your
                        files resulting from the use of our tools.
                    </strong>
                </p>
                <p className="mb-3">
                    While we strive to provide reliable and accurate tools, file processing is
                    inherently subject to risks, including but not limited to:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                    <li>
                        <strong>Accidental file corruption</strong> during conversion or
                        compression due to browser limitations, unsupported file formats, or
                        unexpected file structures.
                    </li>
                    <li>
                        <strong>Data loss</strong> if the browser tab is closed, the page is
                        refreshed, or the browser crashes mid-processing.
                    </li>
                    <li>
                        <strong>Incomplete or inaccurate output</strong> — for example, OCR
                        misreading text, PDF compression affecting visual quality, or background
                        removal producing imperfect results.
                    </li>
                    <li>
                        <strong>Incompatibility</strong> with certain file types, encodings, or
                        password-protected files.
                    </li>
                    <li>
                        <strong>Browser memory limits</strong> causing failures when processing
                        very large files.
                    </li>
                </ul>
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                    <p className="font-semibold text-amber-400 mb-1">⚠ Important Recommendation</p>
                    <p className="text-sm">
                        Always keep a backup of your original files before processing them with any
                        tool on AuraFile. We strongly recommend verifying the output before deleting
                        your original files. AuraFile cannot recover files that are lost or
                        corrupted during processing.
                    </p>
                </div>
            </>
        ),
    },
    {
        id: "limitation-liability",
        number: "7",
        title: "Limitation of Liability",
        content: (
            <>
                <p className="mb-3">
                    To the maximum extent permitted by applicable law,{" "}
                    <strong>
                        AuraFile and its operators shall not be liable for any indirect, incidental,
                        special, consequential, or punitive damages
                    </strong>
                    , including but not limited to:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                    <li>Loss of data, revenue, profit, or business opportunities.</li>
                    <li>Loss of files or damage to files processed through the Service.</li>
                    <li>Cost of procuring substitute services or software.</li>
                    <li>
                        Any unauthorized access to or alteration of your files (note: this is
                        not possible given our client-side architecture, but is stated for
                        completeness).
                    </li>
                    <li>
                        Any matter beyond our reasonable control, including third-party service
                        failures (browser bugs, ISP outages, etc.).
                    </li>
                </ul>
                <p>
                    In jurisdictions where the exclusion or limitation of liability for
                    consequential or incidental damages is not permitted, our liability is limited
                    to the maximum extent allowed by law. Since AuraFile is a free service, our
                    aggregate liability to you shall not exceed{" "}
                    <strong>USD $0 (zero dollars)</strong>.
                </p>
            </>
        ),
    },
    {
        id: "third-party-links",
        number: "8",
        title: "Third-Party Links & Services",
        content: (
            <p>
                AuraFile may contain links to third-party websites or services (such as
                documentation, external tools, or referenced resources). These links are provided
                for your convenience only. We have no control over, and assume no responsibility
                for, the content, privacy policies, or practices of any third-party websites. We
                encourage you to review the privacy policies and terms of any third-party sites you
                visit. The inclusion of any link does not imply endorsement by AuraFile.
            </p>
        ),
    },
    {
        id: "privacy",
        number: "9",
        title: "Privacy",
        content: (
            <p>
                Your use of AuraFile is also governed by our{" "}
                <a href="/privacy-policy" className="text-[#00B4D8] hover:underline">
                    Privacy Policy
                </a>
                , which is incorporated into these Terms by reference. Please review our Privacy
                Policy to understand our practices regarding data collection, cookies, and your
                rights. By using AuraFile, you consent to the data practices described in our
                Privacy Policy.
            </p>
        ),
    },
    {
        id: "modifications-to-service",
        number: "10",
        title: "Modifications to the Service",
        content: (
            <p>
                AuraFile reserves the right, at our sole discretion, to modify, suspend, or
                discontinue any part of the Service — including any specific tool — at any time
                without notice. We may also introduce new tools, change pricing (if any), or update
                features. We shall not be liable to you or any third party for any modification,
                suspension, or discontinuation of the Service.
            </p>
        ),
    },
    {
        id: "changes-to-terms",
        number: "11",
        title: "Changes to These Terms",
        content: (
            <p>
                We reserve the right to update or revise these Terms of Service at any time. When
                we do, we will update the &quot;Last Updated&quot; date at the top of this page.
                Your continued use of AuraFile after any changes have been made constitutes your
                acceptance of the revised Terms. We encourage you to review these Terms
                periodically. If we make material changes, we may provide a more prominent notice
                on our website.
            </p>
        ),
    },
    {
        id: "governing-law",
        number: "12",
        title: "Governing Law & Dispute Resolution",
        content: (
            <>
                <p className="mb-3">
                    These Terms shall be governed by and construed in accordance with the laws of{" "}
                    <strong>India</strong>, without regard to its conflict of law provisions.
                </p>
                <p className="mb-3">
                    Any dispute arising out of or relating to these Terms or your use of AuraFile
                    shall first be attempted to be resolved through good-faith negotiation. If the
                    dispute cannot be resolved informally, it shall be submitted to the exclusive
                    jurisdiction of the courts located in <strong>India</strong>.
                </p>
                <p>
                    If you are accessing AuraFile from outside India, you are responsible for
                    compliance with your local laws. Nothing in these Terms limits your rights
                    under any applicable mandatory consumer protection laws in your jurisdiction.
                </p>
            </>
        ),
    },
    {
        id: "severability",
        number: "13",
        title: "Severability & Entire Agreement",
        content: (
            <p>
                If any provision of these Terms is found to be invalid, illegal, or unenforceable
                by a court of competent jurisdiction, the remaining provisions shall continue in
                full force and effect. These Terms, together with our{" "}
                <a href="/privacy-policy" className="text-[#00B4D8] hover:underline">
                    Privacy Policy
                </a>
                , constitute the entire agreement between you and AuraFile with respect to your use
                of the Service and supersede all prior agreements or understandings, whether written
                or oral.
            </p>
        ),
    },
    {
        id: "contact",
        number: "14",
        title: "Contact Us",
        content: (
            <>
                <p className="mb-3">
                    If you have any questions about these Terms of Service, please contact us:
                </p>
                <div className="bg-foreground/5 rounded-lg p-4 space-y-1">
                    <p>
                        <strong>AuraFile</strong>
                    </p>
                    <p>
                        Email:{" "}
                        <a
                            href="mailto:team@aurafile.net"
                            className="text-[#00B4D8] hover:underline"
                        >
                            team@aurafile.net
                        </a>
                    </p>
                    <p>
                        Website:{" "}
                        <a href="https://aurafile.net" className="text-[#00B4D8] hover:underline">
                            https://aurafile.net
                        </a>
                    </p>
                </div>
                <p className="mt-4 text-sm text-foreground/60">
                    We aim to respond to all inquiries within <strong>5 business days</strong>.
                </p>
            </>
        ),
    },
];

export default function TermsOfService() {
    const lastUpdated = "March 2026";

    return (
        <main className="container mx-auto max-w-4xl px-4 py-16 animate-fade-in">
            {/* Header */}
            <div className="text-center mb-12">
                <h1 className="mb-4 text-[#00B4D8] font-extrabold text-4xl md:text-5xl tracking-tight">
                    Terms of Service
                </h1>
                <p className="text-foreground/60 text-sm">Last Updated: {lastUpdated}</p>
                <p className="mt-4 text-foreground/70 max-w-2xl mx-auto">
                    Please read these Terms carefully before using AuraFile. By using our tools,
                    you agree to be bound by these Terms.
                </p>
            </div>

            {/* Quick Summary Card */}
            <div className="mb-10 rounded-xl border border-[#00B4D8]/30 bg-[#00B4D8]/5 p-6">
                <h2 className="text-lg font-bold text-[#00B4D8] mb-3">
                    📋 Key Points at a Glance
                </h2>
                <ul className="space-y-2 text-foreground/80 text-sm">
                    <li className="flex items-start gap-2">
                        <span className="text-green-400 mt-0.5 shrink-0">✓</span>
                        <span>
                            <strong>Free to use.</strong> All tools are free. You don&apos;t need
                            an account.
                        </span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-green-400 mt-0.5 shrink-0">✓</span>
                        <span>
                            <strong>Your files, your responsibility.</strong> Only process files
                            you own or have legal permission to use.
                        </span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-red-400 mt-0.5 shrink-0">✗</span>
                        <span>
                            <strong>No illegal files.</strong> Do not use AuraFile for illegal
                            content, piracy, malware, CSAM, fraud, or harassment.
                        </span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-yellow-400 mt-0.5 shrink-0">⚠</span>
                        <span>
                            <strong>Back up your files.</strong> We are not responsible for file
                            loss or corruption. Always keep originals.
                        </span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-yellow-400 mt-0.5 shrink-0">⚠</span>
                        <span>
                            <strong>No guarantees.</strong> The Service is provided &quot;as
                            is&quot; — tool output quality may vary.
                        </span>
                    </li>
                </ul>
            </div>

            {/* Table of Contents */}
            <nav className="mb-10 rounded-xl border border-foreground/10 bg-foreground/5 p-6">
                <h2 className="font-semibold text-foreground mb-3">Table of Contents</h2>
                <ol className="space-y-1 text-sm text-[#00B4D8] columns-2">
                    {SECTIONS.map((s) => (
                        <li key={s.id}>
                            <a href={`#${s.id}`} className="hover:underline">
                                {s.number}. {s.title}
                            </a>
                        </li>
                    ))}
                </ol>
            </nav>

            {/* Sections */}
            <div className="space-y-10 text-foreground/80">
                {SECTIONS.map((section) => (
                    <section key={section.id} id={section.id} className="scroll-mt-20">
                        <h2 className="text-xl font-bold text-foreground mb-4 pb-2 border-b border-foreground/10">
                            {section.number}. {section.title}
                        </h2>
                        <div className="text-sm leading-relaxed">{section.content}</div>
                    </section>
                ))}
            </div>

            {/* Footer note */}
            <div className="mt-16 pt-8 border-t border-foreground/10 text-center text-xs text-foreground/50">
                <p>
                    These Terms of Service are effective as of {lastUpdated} and apply to all
                    users of{" "}
                    <a href="https://aurafile.net" className="text-[#00B4D8] hover:underline">
                        aurafile.net
                    </a>
                    .
                </p>
            </div>
        </main>
    );
}
