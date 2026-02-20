import React from 'react';
import { PageTitle, SectionDescription } from "@/components/ui/typography";
import { HowItWorksSection, BenefitsSection, FAQSection, PrivacyBadge, Step, Benefit, FAQItem } from "@/components/sections/ToolSections";
import { IconName } from "@/components/ui/Icon";

interface ToolPageLayoutProps {
    title: string;
    description: string;
    toolComponent: React.ReactNode;
    howItWorks: Step[];
    benefits: Benefit[];
    faq: FAQItem[];
    backgroundImage?: string;
    theme?: "blue" | "red";
}

export default function ToolPageLayout({
    title,
    description,
    toolComponent,
    howItWorks,
    benefits,
    faq,
    theme = "blue"
}: ToolPageLayoutProps) {
    const isRed = theme === "red";
    const gradientColor = isRed ? "from-red-500/5" : "from-primary/5";
    const shadowColor = isRed ? "shadow-red-500/5" : "shadow-primary/5";

    return (
        <div className="min-h-screen bg-background">
            {/* 1. Hero Section */}
            <section className={`relative pt-4 pb-8 md:pt-6 md:pb-12 border-b border-border/40 bg-gradient-to-b ${gradientColor} via-background to-background`}>
                <div className="container mx-auto px-4 md:px-8 max-w-7xl text-center">
                    <PrivacyBadge theme={theme} />
                    <PageTitle className="mb-4">{title}</PageTitle>
                    <SectionDescription className="max-w-2xl mx-auto">{description}</SectionDescription>

                    {/* Tool Slot - The main interactive component */}
                    <div className="w-full relative z-10">
                        {toolComponent}
                    </div>
                </div>
            </section>

            {/* 2. How It Works Section */}
            <HowItWorksSection steps={howItWorks} theme={theme} />

            {/* 3. Benefits Section */}
            <BenefitsSection benefits={benefits} theme={theme} />

            {/* 4. FAQ Section */}
            <FAQSection items={faq} />
        </div>
    );
}

// Re-export types for easier usage in pages
export type { Step, Benefit, FAQItem };
