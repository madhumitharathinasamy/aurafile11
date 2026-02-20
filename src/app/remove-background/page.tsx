import type { Metadata } from "next";
import { RemoveBgToolLoader } from "./RemoveBgToolLoader";
import ToolPageLayout, { Step, Benefit, FAQItem } from "@/components/tools/ToolPageLayout";

export const metadata: Metadata = {
    title: "Remove Background Online – AI Powered | Aura File",
    description: "Remove image backgrounds instantly with AI precision. 100% free and secure browser-based processing.",
    alternates: {
        canonical: "https://aurafile.net/remove-background",
    },
};

export default function RemoveBackgroundPage() {
    const steps: Step[] = [
        {
            title: "Upload Image",
            description: "Upload a JPG or PNG image. For best results, choose an image with a clear subject.",
            icon: "upload-cloud"
        },
        {
            title: "Select Background",
            description: "Click on the background area you want to remove. Our tool detects similar colors.",
            icon: "mouse-pointer"
        },
        {
            title: "Download",
            description: "Adjust the tolerance if needed, then download your transparent PNG.",
            icon: "download"
        }
    ];

    const benefits: Benefit[] = [
        {
            title: "Instant Results",
            description: "Remove backgrounds in seconds without using complex software like Photoshop.",
            icon: "zap"
        },
        {
            title: "Transparent PNG",
            description: "Download images with transparent backgrounds, ready for design projects.",
            icon: "image"
        },
        {
            title: "100% Free",
            description: "No credits or subscriptions required. Process as many images as you need.",
            icon: "gift"
        }
    ];

    const faq: FAQItem[] = [
        {
            question: "How does it work?",
            answer: "The tool uses a color-difference algorithm to detect and remove the background pixels based on your selection."
        },
        {
            question: "Is it automatic?",
            answer: "It uses a 'Magic Wand' approach where you click to select the background. This gives you more control than fully automatic tools."
        },
        {
            question: "What formats are supported?",
            answer: "We support JPG and PNG images. The output will always be a PNG with transparency."
        }
    ];

    return (
        <ToolPageLayout
            title="Remove Background"
            description="Remove image backgrounds instantly. Create transparent images for e-commerce, profiles, and design."
            toolComponent={<RemoveBgToolLoader />}
            howItWorks={steps}
            benefits={benefits}
            faq={faq}
        />
    );
}
