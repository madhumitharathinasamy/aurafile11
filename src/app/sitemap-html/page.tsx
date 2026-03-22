import { siteConfig } from "@/config/site";
import Link from "next/link";
import { MoveRight } from "lucide-react";
import { Metadata } from "next";

export const dynamic = 'force-static';
export const revalidate = 86400;

export const metadata: Metadata = {
    title: "Sitemap | Aura File",
    description: "Navigate all image and PDF tools available on Aura File.",
    alternates: {
        canonical: "https://aurafile.net/sitemap-html",
    },
};

export default function SitemapPage() {
    return (
        <div className="container max-w-4xl py-12 md:py-24 space-y-12">
            <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Sitemap</h1>
                <p className="text-xl text-muted-foreground">
                    A complete overview of all tools and pages available on Aura File.
                </p>
            </div>

            <div className="grid gap-12 md:grid-cols-2">
                {/* Image Tools */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-semibold border-b pb-2">Image Tools</h2>
                    <ul className="space-y-3">
                        {siteConfig.home.tools.image.map((tool) => (
                            <li key={tool.href}>
                                <Link 
                                    href={tool.href}
                                    className="group flex items-start gap-2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <MoveRight className="w-4 h-4 mt-1 shrink-0 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all text-primary" />
                                    <div>
                                        <div className="font-medium text-foreground group-hover:text-primary transition-colors">
                                            {tool.title}
                                        </div>
                                        <div className="text-sm line-clamp-1">{tool.description}</div>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* PDF Tools */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-semibold border-b pb-2">PDF Tools</h2>
                    <ul className="space-y-3">
                        {siteConfig.home.tools.pdf.map((tool) => (
                            <li key={tool.href}>
                                <Link 
                                    href={tool.href}
                                    className="group flex items-start gap-2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <MoveRight className="w-4 h-4 mt-1 shrink-0 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all text-primary" />
                                    <div>
                                        <div className="font-medium text-foreground group-hover:text-primary transition-colors">
                                            {tool.title}
                                        </div>
                                        <div className="text-sm line-clamp-1">{tool.description}</div>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Information Pages */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-semibold border-b pb-2">Information</h2>
                    <ul className="space-y-3">
                        {siteConfig.footer.legal.map((page) => (
                            <li key={page.href}>
                                <Link 
                                    href={page.href}
                                    className="group flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <MoveRight className="w-4 h-4 shrink-0 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all text-primary" />
                                    <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                                        {page.title}
                                    </span>
                                </Link>
                            </li>
                        ))}
                         <li>
                            <Link 
                                href="/"
                                className="group flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <MoveRight className="w-4 h-4 shrink-0 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all text-primary" />
                                <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                                    Homepage
                                </span>
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
