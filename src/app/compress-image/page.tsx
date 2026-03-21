import { Metadata } from "next";
import { CompressToolLoader } from "./CompressToolLoader";
import ToolPageLayout, { Step, Benefit, FAQItem } from "@/components/tools/ToolPageLayout";

export const dynamic = 'force-static';


export const metadata: Metadata = {
    title: "Compress Image - No Upload, 100% Private | AuraFile",
    description: "Compress JPG, PNG & WebP images instantly in your browser. No file uploads, no servers. Your images never leave your device. Free & fast.",
    alternates: {
        canonical: "https://aurafile.net/compress-image",
    },
};

export default function CompressPage() {
    const steps: Step[] = [
        {
            title: "Compress Image - No Upload, 100% Private | AuraFile",
            description: "Compress JPG, PNG & WebP images instantly in your browser. No file uploads, no servers. Your images never leave your device. Free & fast.",
            icon: "upload-cloud"
        },
        {
            title: "Compress Image - No Upload, 100% Private | AuraFile",
            description: "Compress JPG, PNG & WebP images instantly in your browser. No file uploads, no servers. Your images never leave your device. Free & fast.",
            icon: "sliders"
        },
        {
            title: "Compress Image - No Upload, 100% Private | AuraFile",
            description: "Compress JPG, PNG & WebP images instantly in your browser. No file uploads, no servers. Your images never leave your device. Free & fast.",
            icon: "download"
        }
    ];

    const benefits: Benefit[] = [
        {
            title: "Compress Image - No Upload, 100% Private | AuraFile",
            description: "Compress JPG, PNG & WebP images instantly in your browser. No file uploads, no servers. Your images never leave your device. Free & fast.",
            icon: "cpu"
        },
        {
            title: "Compress Image - No Upload, 100% Private | AuraFile",
            description: "Compress JPG, PNG & WebP images instantly in your browser. No file uploads, no servers. Your images never leave your device. Free & fast.",
            icon: "layers"
        },
        {
            title: "Compress Image - No Upload, 100% Private | AuraFile",
            description: "Compress JPG, PNG & WebP images instantly in your browser. No file uploads, no servers. Your images never leave your device. Free & fast.",
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
