import React from 'react';
import Link from 'next/link';

export function DynamicArticle({ size }: { size: string }) {
    return (
        <article className="prose prose-slate max-w-none">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-6">
                How to Compress Image to {size} KB Securely
            </h2>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Whether you're uploading profile photos, submitting government forms online, or attempting to minimize your bandwidth usage, hitting a strict file size barrier like <strong>{size} KB</strong> can be incredibly frustrating. Our specialized targeting engine removes the guesswork by recursively downscaling both the quality and dimensions of your image until it fits perfectly under your target limit.
            </p>

            <h3 className="text-xl font-bold tracking-tight text-slate-900 mt-10 mb-4">
                Why Does File Size Matter?
            </h3>
            <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                    <span className="text-[#0081C9] mt-1 font-bold">✓</span>
                    <div>
                        <strong className="text-slate-800">Government & Official Forms:</strong> Most strict online portals specifically reject file uploads that exceed basic limits like {size} KB to save database space.
                    </div>
                </li>
                <li className="flex items-start gap-3">
                    <span className="text-[#0081C9] mt-1 font-bold">✓</span>
                    <div>
                        <strong className="text-slate-800">Email & Forums:</strong> Avoid exceeding attachment limits by squashing your massive 5MB payloads natively before attaching them.
                    </div>
                </li>
                <li className="flex items-start gap-3">
                    <span className="text-[#0081C9] mt-1 font-bold">✓</span>
                    <div>
                        <strong className="text-slate-800">Website Speed:</strong> Bloated images are the #1 cause of slow, unresponsive websites. Crushing them guarantees rapid load speeds.
                    </div>
                </li>
            </ul>

            <h3 className="text-xl font-bold tracking-tight text-slate-900 mt-10 mb-4">
                Tips to Hit Exactly {size} KB Without Quality Loss
            </h3>
            <p className="text-slate-600 mb-6">
                Most web-based compressors fail to hit specific strict KB limits because they only compress structural quality (which eventually hits a floor). If your resulting image is still too heavy, our algorithm automatically shifts to mathematically scaling down the physical dimensions of the file. 
            </p>
            <p className="text-slate-600 mb-8">
                If the resulting resolution is too small for your liking, you can usually achieve better visual fidelity securely by changing the format. <strong>Converting highly-detailed photographs into WebP</strong> usually yields smaller file sizes compared to standard JPG or PNG structures.
            </p>

            <h3 className="text-xl font-bold tracking-tight text-slate-900 mt-10 mb-4">
                Explore Related Tools
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 not-prose">
                <Link href="/compress-image" className="p-4 rounded-xl border border-slate-200 hover:border-[#0081C9] hover:shadow-md transition-all flex flex-col gap-1 group">
                    <span className="font-bold text-slate-800 group-hover:text-[#0081C9] transition-colors">General Compressor</span>
                    <span className="text-sm text-slate-500">Need standard compression without a strict KB limit?</span>
                </Link>
                <Link href="/resize-image" className="p-4 rounded-xl border border-slate-200 hover:border-[#0081C9] hover:shadow-md transition-all flex flex-col gap-1 group">
                    <span className="font-bold text-slate-800 group-hover:text-[#0081C9] transition-colors">Image Resizer</span>
                    <span className="text-sm text-slate-500">Scale the exact pixel dimensions to fit passport templates.</span>
                </Link>
                <Link href="/image-converter" className="p-4 rounded-xl border border-slate-200 hover:border-[#0081C9] hover:shadow-md transition-all flex flex-col gap-1 group">
                    <span className="font-bold text-slate-800 group-hover:text-[#0081C9] transition-colors">Convert to WebP</span>
                    <span className="text-sm text-slate-500">Convert your image to WebP naturally for drastic size reduction.</span>
                </Link>
                <Link href="/compress-pdf" className="p-4 rounded-xl border border-slate-200 hover:border-[#0081C9] hover:shadow-md transition-all flex flex-col gap-1 group">
                    <span className="font-bold text-slate-800 group-hover:text-[#0081C9] transition-colors">Compress Documents</span>
                    <span className="text-sm text-slate-500">Apply the same strict size limits to PDF documents.</span>
                </Link>
            </div>
        </article>
    );
}
