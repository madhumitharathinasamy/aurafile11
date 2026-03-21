import { Metadata } from "next";
import { ResizeToolLoader } from "./ResizeToolLoader";
import ToolPageLayout, { Step, Benefit, FAQItem } from "@/components/tools/ToolPageLayout";

export const dynamic = 'force-static';


export const metadata: Metadata = {
    title: "Image Resizer for Social Media – Resize Online Free | AuraFile",
    description: "Resize images by pixels, percentage, or social presets. 100% browser-based. No uploads required.",
    alternates: {
        canonical: "https://aurafile.net/resize-image",
    },
};

export default function ResizePage() {
    const steps: Step[] = [
        {
            title: "Upload Images",
            description: "Drag & drop JPG, PNG, or WEBP files directly into the browser.",
            icon: "upload-cloud"
        },
        {
            title: "Choose Dimensions",
            description: "Set custom width/height in pixels or select a social media preset.",
            icon: "settings"
        },
        {
            title: "Download",
            description: "Instantly download your resized images. No server uploads needed.",
            icon: "download"
        }
    ];

    const benefits: Benefit[] = [
        {
            title: "100% Private",
            description: "Your images are processed securely in your browser and never sent to our servers.",
            icon: "shield-check"
        },
        {
            title: "Lightning Fast",
            description: "Powered by high-performance browser engines, resizing takes milliseconds.",
            icon: "zap"
        },
        {
            title: "Precision Control",
            description: "Set exact pixel dimensions or scale by percentage without losing quality.",
            icon: "maximize"
        }
    ];

    const faq: FAQItem[] = [
        {
            question: "Does resizing images reduce quality?",
            answer: "It depends. Reducing dimensions usually maintains quality. Enlarging images may cause pixelation, but we use high-quality algorithms (lanczos/bicubic) to minimize this effect."
        },
        {
            question: "What formats are supported?",
            answer: "We support JPG, PNG, and WEBP for resizing. You can also upload these formats and save them as a different format if needed."
        },
        {
            question: "Is this tool free to use?",
            answer: "Yes, AuraFile's image resizer is 100% free with no hidden costs, limits, or watermarks."
        },
        {
            question: "How do I resize for Instagram?",
            answer: "Simply use the 'Social Media' presets in the tool settings to automatically select the perfect dimensions for Instagram Posts (1080x1080) or Stories (1080x1920)."
        },
        {
            question: "Are my images uploaded to a server?",
            answer: "No. All resizing happens locally in your browser using modern WebAssembly and Canvas APIs. Your files never leave your device."
        }
    ];

    return (
        <ToolPageLayout
            title="Resize Image"
            description="Resize images by pixels, percentage, or social presets. 100% browser-based. No uploads required."
            toolComponent={<ResizeToolLoader />}
            howItWorks={steps}
            benefits={benefits}
            faq={faq}
        />
    );
}
