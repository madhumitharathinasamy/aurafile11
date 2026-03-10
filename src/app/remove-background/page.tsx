import type { Metadata } from 'next';
import { RemoveBgToolLoader } from './RemoveBgToolLoader';
import ToolPageLayout, { Step, Benefit, FAQItem } from '@/components/tools/ToolPageLayout';

export const metadata: Metadata = {
    title: 'Remove Background Online – AI Background Remover | AuraFile',
    description: 'Automatically remove image backgrounds using AI — entirely in your browser. No uploads, 100% private, free.',
    alternates: {
        canonical: 'https://aurafile.net/remove-background',
    },
};

export default function RemoveBackgroundPage() {
    const steps: Step[] = [
        {
            title: "Upload Your Image",
            description: "Drag & drop or select any JPG, PNG, or WebP image. Your file never leaves your device.",
            icon: "upload-cloud"
        },
        {
            title: "AI Removes Background",
            description: "Our on-device AI model detects subjects and precisely cuts out the background in seconds.",
            icon: "wand-2"
        },
        {
            title: "Download Result",
            description: "Download your image with a transparent background or choose a custom color fill.",
            icon: "download"
        }
    ];

    const benefits: Benefit[] = [
        {
            title: "100% Private",
            description: "The AI runs entirely in your browser. Your images are never uploaded to any server.",
            icon: "shield-check"
        },
        {
            title: "No Sign-Up Needed",
            description: "No account, no subscription, no credit card. Just open the page and start removing backgrounds.",
            icon: "zap"
        },
        {
            title: "Transparent or Custom Background",
            description: "Export as PNG with full transparency, or pick a solid color or blur effect for the background.",
            icon: "layers"
        }
    ];

    const faq: FAQItem[] = [
        {
            question: "Why does it take a moment on the first use?",
            answer: "The AI model (~50MB for the medium setting) is downloaded once to your browser and then cached. Subsequent uses on the same device are instant."
        },
        {
            question: "What image formats are supported?",
            answer: "You can upload JPG, PNG, and WebP images. Results are exported as PNG (with transparency) or JPG."
        },
        {
            question: "Are my images safe?",
            answer: "Absolutely. The entire AI processing happens locally in your browser. Your images are never sent to our servers."
        },
        {
            question: "Can I choose a different background?",
            answer: "Yes. After removing the background you can choose a transparent background (PNG), a solid color, or a blur effect before downloading."
        },
        {
            question: "Which AI model should I choose?",
            answer: "The 'Medium' model (default) gives the best balance of speed and quality. Use 'Small' for faster processing, or 'Large' for fine hair and complex edges."
        }
    ];

    return (
        <ToolPageLayout
            title="AI Background Remover"
            description="Remove image backgrounds instantly using on-device AI. 100% private — no uploads, no accounts."
            toolComponent={<RemoveBgToolLoader />}
            howItWorks={steps}
            benefits={benefits}
            faq={faq}
        />
    );
}
