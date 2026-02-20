import type { Metadata } from "next";
import { ImageToPdfToolLoader } from "./ImageToPdfToolLoader";
import ToolPageLayout, { Step, Benefit, FAQItem } from "@/components/tools/ToolPageLayout";

export const metadata: Metadata = {
    title: "Image to PDF – JPG PNG to PDF | Aura File",
    description: "Convert JPG, PNG, and WebP images to PDF document online. Free, secure, and fast.",
    alternates: {
        canonical: "https://aurafile.net/image-to-pdf",
    },
};

export default function ImageToPdfPage() {
    const steps: Step[] = [
        {
            title: "Upload Images",
            description: "Select JPG, PNG, or WebP images you want to combine into a PDF.",
            icon: "image"
        },
        {
            title: "Reorder",
            description: "Drag and drop thumbnails to arrange your pages in the perfect order.",
            icon: "move"
        },
        {
            title: "Convert",
            description: "Click 'Convert to PDF' and download your new document instantly.",
            icon: "file-text"
        }
    ];

    const benefits: Benefit[] = [
        {
            title: "Combine Photos",
            description: "Merge multiple receipts, photos, or screenshots into a single shareable PDF file.",
            icon: "layers"
        },
        {
            title: "Universal Format",
            description: "PDFs work on every device. Ensure your images are viewed exactly as intended.",
            icon: "globe"
        },
        {
            title: "Secure Processing",
            description: "Your photos are processed locally and never uploaded to any server.",
            icon: "lock"
        }
    ];

    const faq: FAQItem[] = [
        {
            question: "Can I rearrange images?",
            answer: "Yes! Simply drag and drop the image thumbnails to change their order before converting."
        },
        {
            question: "Is there a limit on pages?",
            answer: "You can add as many images as your browser memory allows, but we recommend keeping it under 50 pages for best performance."
        },
        {
            question: "Does it support HEIC?",
            answer: "Currently, we support JPG, PNG, and WebP. For HEIC, please use our Image Converter tool first."
        }
    ];

    return (
        <ToolPageLayout
            title="Convert Images to PDF"
            description="Turn your JPG, PNG, and WebP images into a single PDF document instantly. Organize and share photos easily."
            toolComponent={<ImageToPdfToolLoader />}
            howItWorks={steps}
            benefits={benefits}
            faq={faq}
            theme="blue"
        />
    );
}
