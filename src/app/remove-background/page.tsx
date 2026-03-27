import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import ToolPageLayout from '@/components/tools/ToolPageLayout';
import { RemoveBackgroundArticle } from './RemoveBackgroundArticle';
import { UploaderSkeleton } from '@/components/ui/UploaderSkeleton';

import RemoveBackgroundToolLoader from './RemoveBackgroundToolLoader';

export const metadata: Metadata = {
    title: 'AI Background Remover \u2013 Free, Private On-Device Tool | AuraFile',
    description: 'Remove backgrounds from any image instantly using local AI. 100% private processing in your browser \u2014 no uploads, no accounts, no limits.',
};

export default function RemoveBackgroundPage() {
    return (
        <ToolPageLayout
            title="AI Background Remover"
            description="Isolate subjects instantly using on-device neural networks. Your photos never leave your device."
            toolComponent={<RemoveBackgroundToolLoader />}
            howItWorks={[
                {
                    title: "Upload Image",
                    description: "Select an image with a clear subject. JPG, PNG and WebP are supported.",
                    icon: "upload-cloud"
                },
                {
                    title: "AI Processing",
                    description: "The AI isolates the subject locally in your browser. No data is uploaded.",
                    icon: "wand-2"
                },
                {
                    title: "Download PNG",
                    description: "Save your result as a high-quality transparent PNG file instantly.",
                    icon: "download"
                }
            ]}
            benefits={[
                {
                    title: "On-Device Privacy",
                    description: "Your images never leave your browser for maximum confidentiality.",
                    icon: "shield-check"
                },
                {
                    title: "High Precision",
                    description: "Professional-grade edge detection for complex subjects and hair.",
                    icon: "zap"
                },
                {
                    title: "Free & Unlimited",
                    description: "No subscription required. Process as many images as you need.",
                    icon: "layers"
                }
            ]}
            breadcrumbs={[
                { label: "Home", href: "/" },
                { label: "Image Tools", href: "/image-tools" },
                { label: "AI Background Remover", href: "/remove-background" }
            ]}
            longFormContent={<RemoveBackgroundArticle />}
            faq={[
                {
                    question: "Is my image uploaded to your server?",
                    answer: "No. All AI processing happens locally in your browser using your device's hardware. We never see your images."
                },
                {
                    question: "Why is there a download at the start?",
                    answer: "To remove backgrounds locally, your browser needs to download the compressed AI model (~50MB). This is done only once and then cached."
                },
                {
                    question: "What image formats are supported?",
                    answer: "We support JPG, PNG, and WebP formats up to 50MB."
                }
            ]}
        />
    );
}
