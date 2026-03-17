import type { Metadata } from "next";
import { CropToolLoader } from "./CropToolLoader";
import ToolPageLayout, { Step, Benefit, FAQItem } from "@/components/tools/ToolPageLayout";export const dynamic = 'force-static';


export const metadata: Metadata = {
    title: "Crop Image Online – Fast & Secure | Aura File",
    description: "Crop your images online for free. Adjust aspect ratios and trim edges instantly in your browser.",
    alternates: {
        canonical: "https://aurafile.net/crop-image",
    },
};

export default function CropPage() {
    const steps: Step[] = [
        {
            title: "Upload Image",
            description: "Upload the JPG, PNG, or WEBP image you want to crop.",
            icon: "upload-cloud"
        },
        {
            title: "Adjust Selection",
            description: "Drag the corners of the crop box or select a preset aspect ratio.",
            icon: "crop"
        },
        {
            title: "Download",
            description: "Apply the crop and download your perfectly framed image.",
            icon: "download"
        }
    ];

    const benefits: Benefit[] = [
        {
            title: "Custom Aspect Ratios",
            description: "Easily crop to standard ratios like 16:9, 4:3, 1:1, or custom dimensions.",
            icon: "maximize"
        },
        {
            title: "Lossless Cropping",
            description: "Trim your images without reducing quality or changing file format.",
            icon: "image"
        },
        {
            title: "Instant Preview",
            description: "See exactly what your cropped image will look like in real-time.",
            icon: "eye"
        }
    ];

    const faq: FAQItem[] = [
        {
            question: "Does cropping reduce image quality?",
            answer: "No, cropping simply removes pixels from the edges. The remaining part of the image retains its original quality."
        },
        {
            question: "Can I crop specifically for social media?",
            answer: "Yes! Use our preset aspect ratios to crop perfectly for Instagram, Twitter, and Facebook posts."
        },
        {
            question: "Is it secure?",
            answer: "As with all our tools, your image is processed locally in your browser and never uploaded to our servers."
        }
    ];

    return (
        <ToolPageLayout
            title="Crop Image"
            description="Trim unwanted parts from your photos instantly. Adjust aspect ratios and focus on what matters."
            toolComponent={<CropToolLoader />}
            howItWorks={steps}
            benefits={benefits}
            faq={faq}
        />
    );
}
