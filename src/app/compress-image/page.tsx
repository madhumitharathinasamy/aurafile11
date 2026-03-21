import { Metadata } from "next";
import { CompressToolLoader } from "./CompressToolLoader";
import ToolPageLayout, { Step, Benefit, FAQItem } from "@/components/tools/ToolPageLayout";

export const dynamic = 'force-static';


export const metadata: Metadata = {
    title: "Compress Image Online – Fast & Secure | AuraFile",
    description: "Compress images online without quality loss. Secure, browser-based image compression. No uploads. Free and fast.",
    alternates: {
        canonical: "https://aurafile.net/compress-image",
    },
};

export default function CompressPage() {
    const steps: Step[] = [
        {
            title: "Upload Images",
            description: "Select up to 10 images (JPG, PNG, WEBP) to compress.",
            icon: "upload-cloud"
        },
        {
            title: "Adjust Quality",
            description: "Use the slider to find the perfect balance between size and quality.",
            icon: "sliders"
        },
        {
            title: "Download",
            description: "Download your smaller files instantly, individually or as a ZIP.",
            icon: "download"
        }
    ];

    const benefits: Benefit[] = [
        {
            title: "Smart Compression",
            description: "Reduce file size by up to 80% while preserving visual quality using advanced algorithms.",
            icon: "cpu"
        },
        {
            title: "Batch Processing",
            description: "Compress multiple images at once. Oversized files are skipped automatically.",
            icon: "layers"
        },
        {
            title: "Privacy First",
            description: "No uploads. All processing happens locally in your browser for maximum security.",
            icon: "lock"
        }
    ];

    const faq: FAQItem[] = [
        {
            question: "Does compressing images reduce quality?",
            answer: "Our smart compression algorithms significantly reduce file size while maintaining visual quality that is often indistinguishable from the original."
        },
        {
            question: "What is the maximum file size?",
            answer: "Each image can be up to 25MB. You can upload and process up to 10 images simultaneously."
        },
        {
            question: "Are my images uploaded to your servers?",
            answer: "No. All compression happens locally in your browser. Your files never leave your device."
        },
        {
            question: "Is this tool free?",
            answer: "Yes, AuraFile Image Compressor is 100% free to use with no hidden costs."
        },
        {
            question: "What formats do you support?",
            answer: "We currently support compressing JPG, PNG, and WebP images."
        }
    ];

    return (
        <ToolPageLayout
            title="Compress Image"
            description="Reduce image file size securely in your browser without uploading files. Fast, free, and private."
            toolComponent={<CompressToolLoader />}
            howItWorks={steps}
            benefits={benefits}
            faq={faq}
        />
    );
}
