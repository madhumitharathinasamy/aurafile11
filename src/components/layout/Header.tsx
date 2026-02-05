"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { siteConfig } from "@/config/site";

import { Icon } from "@/components/ui/Icon";

export function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
            <div className="container mx-auto flex h-16 max-w-[var(--container-width)] items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary">
                    <Image src="/favicon.ico" alt="Logo" width={32} height={32} />
                    <span className="bg-gradient-to-br from-primary to-[#8e1c90] bg-clip-text text-transparent">
                        {siteConfig.name}
                    </span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden gap-6 md:flex">
                    {siteConfig.header.nav.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="text-sm font-medium text-muted transition-colors hover:text-foreground"
                        >
                            {item.title}
                        </Link>
                    ))}
                </nav>

                {/* Mobile Menu Button */}
                <div className="md:hidden">
                    <button
                        onClick={toggleMenu}
                        aria-label="Toggle Menu"
                        className="p-2 text-foreground"
                    >
                        {/* Mobile Menu Icon */}
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            {isMenuOpen ? (
                                <path d="M18 6L6 18M6 6l12 12" />
                            ) : (
                                <path d="M3 12h18M3 6h18M3 18h18" />
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Nav Content */}
            {isMenuOpen && (
                <div className="absolute left-0 right-0 top-full flex flex-col gap-4 border-b border-border bg-background p-4 shadow-lg md:hidden animate-in slide-in-from-top-2">
                    {siteConfig.header.nav.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="rounded-md p-3 text-lg font-medium hover:bg-surface"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            {item.title}
                        </Link>
                    ))}
                </div>
            )}
        </header>
    );
}
