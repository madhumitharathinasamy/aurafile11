import { siteConfig } from "@/config/site";
import Link from "next/link";

export function Footer() {
    return (
        <footer className="mt-auto border-t border-border bg-surface py-12 md:py-16">
            <div className="container mx-auto flex flex-col items-center gap-6 px-4">
                <nav className="flex flex-wrap justify-center gap-8">
                    {siteConfig.footer.legal.map((link) => (
                        <Link key={link.href} href={link.href} className="text-sm text-text-secondary transition-colors hover:text-primary hover:underline">
                            {link.title}
                        </Link>
                    ))}
                </nav>
                <p className="text-xs text-muted">{siteConfig.footer.copyright}</p>
            </div>
        </footer>
    );
}
