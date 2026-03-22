import type { Metadata } from "next";
import { MergePdfToolLoader } from "./MergePdfToolLoader";
import ToolPageLayout, { Step, Benefit, FAQItem } from "@/components/tools/ToolPageLayout";

export const dynamic = 'force-static';


export const metadata: Metadata = {
    title: "Merge PDF Free - Private, No Upload | AuraFile",
    description: "Combine multiple PDF files into one instantly in your browser. No uploads, no accounts. 100% private PDF merging. Free forever.",
    alternates: {
        canonical: "https://aurafile.net/merge-pdf",
    },
};

export default function MergePdfPage() {
    const steps: Step[] = [
        {
            title: "Merge PDF Free - Private, No Upload | AuraFile",
            description: "Combine multiple PDF files into one instantly in your browser. No uploads, no accounts. 100% private PDF merging. Free forever.",
            icon: "upload-cloud"
        },
        {
            title: "Merge PDF Free - Private, No Upload | AuraFile",
            description: "Combine multiple PDF files into one instantly in your browser. No uploads, no accounts. 100% private PDF merging. Free forever.",
            icon: "layers"
        },
        {
            title: "Merge PDF Free - Private, No Upload | AuraFile",
            description: "Combine multiple PDF files into one instantly in your browser. No uploads, no accounts. 100% private PDF merging. Free forever.",
            icon: "download"
        }
    ];

    const benefits: Benefit[] = [
        {
            title: "Merge PDF Free - Private, No Upload | AuraFile",
            description: "Combine multiple PDF files into one instantly in your browser. No uploads, no accounts. 100% private PDF merging. Free forever.",
            icon: "file-text"
        },
        {
            title: "Merge PDF Free - Private, No Upload | AuraFile",
            description: "Combine multiple PDF files into one instantly in your browser. No uploads, no accounts. 100% private PDF merging. Free forever.",
            icon: "lock"
        },
        {
            title: "Merge PDF Free - Private, No Upload | AuraFile",
            description: "Combine multiple PDF files into one instantly in your browser. No uploads, no accounts. 100% private PDF merging. Free forever.",
            icon: "folder"
        }
    ];

    const faq: FAQItem[] = [
        {
            question: "How many files can I merge?",
            answer: "You can merge as many PDF files as you like, provided they fit within your browser's memory limits."
        },
        {
            question: "Can I reorder pages inside the PDFs?",
            answer: "This tool merges whole files. To reorder individual pages, first split them or use our page organizer tool (coming soon)."
        },
        {
            question: "Is it free?",
            answer: "Yes, merging PDFs is completely free with no watermarks."
        }
    ];

    return (
        <ToolPageLayout
            title="Merge PDF Files"
            description="Combine multiple PDF documents into one file instantly. Organize your documents efficiently."
            toolComponent={<MergePdfToolLoader />}
            howItWorks={steps}
            benefits={benefits}
            faq={faq}
        />
    );
}
