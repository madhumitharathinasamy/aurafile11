import { Metadata } from "next";
import { ConvertToolLoader } from "./ConvertToolLoader";
import ToolPageLayout, { Step, Benefit, FAQItem } from "@/components/tools/ToolPageLayout";

export const metadata: Metadata = {
    title: "Convert Image Online - JPG PNG WebP AVIF | AuraFile",
    description: "Convert images online to JPG, PNG, WebP, AVIF, TIFF, or GIF. Fast, secure, and private browser-based conversion with AuraFile.",
    alternates: {
        canonical: "https://aurafile.net/image-converter",
    },
};

export default function ConvertPage() {
    const steps: Step[] = [
        {
            title: "Upload Files",
            description: "Drag & drop your images (JPG, PNG, HEIC, WebP) into the converter.",
            icon: "upload-cloud"
        },
        {
            title: "Select Format",
            description: "Choose your desired output format (JPG, PNG, WebP, AVIF, etc.).",
            icon: "settings"
        },
        {
            title: "Convert & Download",
            description: "Click convert and download your new images instantly.",
            icon: "download"
        }
    ];

    const benefits: Benefit[] = [
        {
            title: "100% Secure & Private",
            description: "All conversions happen directly in your browser. Your images never leave your device.",
            icon: "shield-check"
        },
        {
            title: "Blazing Fast",
            description: "Powered by WebAssembly and advanced browser APIs for instant batch processing.",
            icon: "zap"
        },
        {
            title: "Premium Quality",
            description: "Smart compression and detailed format control ensure the best visual results.",
            icon: "star"
        }
    ];

    const faq: FAQItem[] = [
        {
            question: "Is it free to use?",
            answer: "Yes, AuraFile Image Converter is completely free with no limits on daily conversions."
        },
        {
            question: "Can I convert HEIC files from iPhone?",
            answer: "Absolutely! We support HEIC to JPG conversion directly in your browser, perfect for Windows or Android users."
        },
        {
            question: "Does it support transparency?",
            answer: "Yes, converting to PNG, WebP, or AVIF preserves transparency. If converting to JPG, you can choose a background color."
        }
    ];

    return (
        <ToolPageLayout
            title="Convert Image"
            description="The ultimate browser-based image converter. Transform JPG, PNG, WebP, AVIF, HEIC, and more instantly."
            toolComponent={<ConvertToolLoader />}
            howItWorks={steps}
            benefits={benefits}
            faq={faq}
        />
    );
}
