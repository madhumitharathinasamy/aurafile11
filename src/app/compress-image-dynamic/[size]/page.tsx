import { Metadata } from 'next';
import { CompressDynamicToolLoader } from './CompressDynamicToolLoader';
import ToolPageLayout from '@/components/tools/ToolPageLayout';
import { DynamicArticle } from './DynamicArticle';
import Link from 'next/link';

export async function generateMetadata({ params }: { params: Promise<{ size: string }> }): Promise<Metadata> {
    const { size } = await params;
    return {
        title: `Compress Image to ${size} KB Online (Free & Secure) \u2013 AuraFile`,
        description: `Reduce image size to exactly ${size} KB without losing quality. Fast, secure, no upload required. Instant online compression.`,
        alternates: {
            canonical: `https://aurafile.net/compress-image-to-${size}kb`,
        },
    };
}

export default async function DynamicCompressImagePage({ params }: { params: Promise<{ size: string }> }) {
    const { size } = await params;

    const steps = [
        {
            title: "Select Images",
            description: "Choose one or multiple images form your device. We support JPG, PNG, and WebP formats.",
            icon: "upload" as const
        },
        {
            title: "Automatic Compression",
            description: `We will automatically apply intelligent settings to compress your image to approx ${size} KB without destroying quality.`,
            icon: "settings" as const
        },
        {
            title: "Download Optimized",
            description: "Save the compressed images individually or as a ZIP file. Everything happens instantly.",
            icon: "download" as const
        }
    ];

    const benefits = [
        {
            title: "Client-Side Processing",
            description: "Your images never leave your device. All compression happens locally in your browser for absolute privacy and maximum speed.",
            icon: "shield" as const
        },
        {
            title: "Target Size Optimization",
            description: `Hit exactly the ${size} KB limit you need using advanced algorithms that intelligently dial down data bloat.`,
            icon: "zap" as const
        },
        {
            title: "Batch Support",
            description: "Compress multiple images simultaneously. Our tool utilizes your device's multi-core processor for parallel compression.",
            icon: "layers" as const
        }
    ];

    const faq = [
        {
            question: "Are my photos uploaded to a server?",
            answer: "No. Our tool uses WebAssembly to compress your images directly inside your web browser. Your photos never leave your device, ensuring 100% privacy."
        },
        {
            question: `How does it hit exactly ${size} KB?`,
            answer: `It repeatedly tests compression parameters internally and strategically reduces dimensions if necessary to output a file that safely meets your strict ${size} KB barrier without you having to randomly guess at sliders.`
        },
        {
            question: "What formats do you support?",
            answer: "We currently support compressing JPG, PNG, and WebP images."
        },
        {
            question: `Why is my image not reducing to ${size} KB?`,
            answer: `If you started with an extremely large file (e.g. 10MB), crushing it beneath ${size} KB requires aggressively scaling down the physical dimensions. Use our resize tool first if you wish to control those dimensions specifically.`
        }
    ];

    return (
        <div className="flex flex-col items-center w-full">
            {/* Quick basic compression banner directly integrated */}
            <div className="w-full bg-[#0081C9]/10 py-3 text-center border-b border-[#0081C9]/20">
                <span className="text-sm font-medium text-slate-700">
                    Need quick general compression without strict size limits? 
                    <Link href="/compress-image" className="ml-2 font-bold text-[#0081C9] hover:underline">
                        Try our basic tool →
                    </Link>
                </span>
            </div>

            <ToolPageLayout
                title={`Compress Image to ${size} KB`}
                description={`Reduce image file size to exactly ${size} KB securely in your browser without uploading files. Fast, free, and private.`}
                toolComponent={
                    <div className="flex flex-col">
                        {/* SEO Navigation Preset Chips Above Tool */}
                        <div className="flex flex-wrap items-center justify-center gap-2 p-4 bg-slate-50 border-b border-slate-100 rounded-t-2xl">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-2 hidden md:inline-block">Popular Sizes:</span>
                            {['20', '50', '100', '200', '500'].map((preset) => (
                                <Link 
                                    key={preset} 
                                    href={`/compress-image-to-${preset}kb`}
                                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${preset === size ? 'bg-[#0081C9] text-white border-[#0081C9] shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100 hover:border-slate-300'}`}
                                >
                                    {preset} KB
                                </Link>
                            ))}
                        </div>
                        
                        <CompressDynamicToolLoader defaultTargetSize={size} />
                        
                        {/* UI Microcopy Under Tool */}
                        <div className="flex flex-wrap items-center justify-center gap-4 py-4 px-6 bg-slate-50/50 border-t border-slate-100 rounded-b-2xl">
                            <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                                <span className="font-bold">✓</span> Exact size guaranteed
                            </div>
                            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                                <span className="font-bold">✓</span> No upload. 100% private
                            </div>
                            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hidden md:flex">
                                <span className="font-bold">✓</span> Works perfectly for govt. forms
                            </div>
                        </div>
                    </div>
                }
                howItWorks={steps}
                benefits={benefits}
                faq={faq}
                breadcrumbs={[
                    { label: "Home", href: "/" },
                    { label: "Image Tools", href: "/image-tools" },
                    { label: "Compress Image", href: "/compress-image" },
                    { label: `${size} KB`, href: `/compress-image-to-${size}kb` }
                ]}
                longFormContent={<DynamicArticle size={size} />}
            />
        </div>
    );
}
