import React from 'react';
import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';

export function RemoveBackgroundArticle() {
    return (
        <article className="prose prose-slate max-w-none">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-8 tracking-tight">AI Background Removal: Precision in Your Browser</h2>
            
            <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 mb-10">
                <p className="m-0 text-primary-foreground/80 font-medium">
                    Our background removal tool uses state-of-the-art neural networks (U-2-Net architectures) to isolate subjects with pixel-perfect accuracy—all without your data ever leaving your device.
                </p>
            </div>

            <p className="text-lg leading-relaxed text-slate-600 mb-8">
                Isolating a subject from its background is one of the most common yet tedious tasks in image editing. Whether you're preparing product listings for E-commerce or creating marketing materials, our AI tool saves you hours of manual masking.
            </p>

            <h3 className="text-2xl font-bold text-slate-900 mt-12 mb-6">How It Works</h3>
            <div className="grid md:grid-cols-3 gap-6 mb-12">
                {[
                    { title: "Select Image", desc: "Upload a JPG, PNG, or WebP. Portraits and well-lit products work best.", icon: "upload-cloud" },
                    { title: "AI Analysis", desc: "The model runs locally, identifying edges, hair, and complex contours.", icon: "cpu" },
                    { title: "Download PNG", desc: "Save your result as a high-quality transparent PNG file instantly.", icon: "file-check" }
                ].map((step, i) => (
                    <div key={i} className="p-5 rounded-xl border border-slate-100 bg-slate-50/50">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm mb-4">
                            <Icon name={step.icon as any} size={20} className="text-primary" />
                        </div>
                        <h4 className="font-bold text-slate-900 mb-2">{step.title}</h4>
                        <p className="text-sm text-slate-500 m-0">{step.desc}</p>
                    </div>
                ))}
            </div>

            <h3 className="text-2xl font-bold text-slate-900 mt-12 mb-6">Designed for Privacy and Performance</h3>
            <p className="text-slate-600 mb-6">
                Most AI tools require you to upload your files to their servers. This not only consumes data but compromises privacy. AuraFile executes the entire AI inference process in your browser via <strong>WebAssembly (WASM)</strong> and <strong>WebGL</strong>.
            </p>
            
            <ul className="space-y-4 text-slate-600 mb-10">
                <li className="flex gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                    <span><strong>100% Confidential:</strong> Sensitive product prototypes or personal photos stay in your local memory.</span>
                </li>
                <li className="flex gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                    <span><strong>No Usage Limits:</strong> Because you use your own hardware power, we don't need to charge for cloud processing time.</span>
                </li>
                <li className="flex gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                    <span><strong>Industry Quality:</strong> Utilizing the same models used by professional photographers for hair and detail isolation.</span>
                </li>
            </ul>

            <div className="mt-16 p-8 rounded-3xl bg-slate-900 text-white relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                    <div className="flex-1">
                        <h4 className="text-2xl font-bold mb-4">Ready for your listings?</h4>
                        <p className="text-slate-300 mb-0">After removing the background, you might want to optimize the file size for your website.</p>
                    </div>
                    <Link 
                        href="/compress-image" 
                        className="px-8 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-100 transition-colors inline-block"
                    >
                        Compress Image
                    </Link>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-3xl rounded-full -mr-32 -mt-32"></div>
            </div>
        </article>
    );
}
