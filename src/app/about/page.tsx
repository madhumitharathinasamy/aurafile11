import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
    title: "About Us",
    description: "Learn about Aura File - The secure, fast, and free image toolkit.",
};

export default function AboutPage() {
    return (
        <>
            <PageHeader
                title="About Aura File"
                subtitle="Secure, fast, and free tools to help you master your images."
            />

            <main className="container mx-auto max-w-[1000px] pb-12 px-4 md:pb-12">

                {/* Mission / Story Section */}
                <section className="mb-24 grid gap-8 md:mb-12">
                    <div className="mx-auto max-w-[800px] text-center">
                        <h2 className="mb-6 text-3xl font-bold md:text-4xl text-foreground">Who are we?</h2>
                        <p className="mb-6 text-lg md:text-xl leading-relaxed text-muted-foreground">
                            Since 2024, Aura File has been dedicated to providing user-friendly image editing tools that are quick to process with high-quality results.
                            We noticed that most free online tools were full of ads, slow, or unsafe. We wanted to build something better.
                        </p>
                        <p className="text-lg md:text-xl leading-relaxed text-muted-foreground">
                            Based in the cloud but running locally in your browser when possible, Aura File is designed to be the <strong>safest</strong> place to edit your photos online.
                        </p>
                    </div>
                </section>

                {/* Stats Grid */}
                <section className="mb-24 grid grid-cols-1 gap-8 md:mb-12 sm:grid-cols-3 text-center">
                    <div className="rounded-xl bg-surface p-8">
                        <div className="mb-2 text-4xl font-extrabold text-primary">100%</div>
                        <div className="font-medium text-muted">Secure Processing</div>
                    </div>
                    <div className="rounded-xl bg-surface p-8">
                        <div className="mb-2 text-4xl font-extrabold text-accent">0</div>
                        <div className="font-medium text-muted">Files Stored Permanently</div>
                    </div>
                    <div className="rounded-xl bg-surface p-8">
                        <div className="mb-2 text-4xl font-extrabold text-success">Free</div>
                        <div className="font-medium text-muted">Forever</div>
                    </div>
                </section>

                {/* Values Section */}
                <section className="mb-24 md:mb-12">
                    <h2 className="mb-12 text-center text-3xl font-bold md:text-4xl text-foreground">Why choose Aura File?</h2>
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                        <Card
                            title="Privacy First"
                            description="We believe your files belong to you. Our architecture ensures automatic deletion and strict privacy controls."
                            icon={<span className="text-2xl">🔒</span>}
                        />
                        <Card
                            title="Global Community"
                            description="Helping millions of users worldwide (eventually!) to process their images in seconds."
                            icon={<span className="text-2xl">🌍</span>}
                        />
                        <Card
                            title="Ongoing Updates"
                            description="We are constantly launching new tools and features to give users easier workflows and higher quality results."
                            icon={<span className="text-2xl">🚀</span>}
                        />
                    </div>
                </section>

                {/* Media Kit Section */}
                <section className="rounded-xl bg-gradient-to-br from-[#1f1f23] to-black px-8 py-16 text-center text-white">
                    <h2 className="mb-6 text-3xl md:text-4xl font-bold">Media Kit</h2>
                    <p className="mx-auto mb-8 max-w-[600px] text-lg md:text-xl text-gray-400">
                        Writing about Aura File? Download our official logos and brand assets here.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <a href="/favicon.ico" download="aurafile-logo.ico" className="no-underline">
                            <Button variant="secondary" className="bg-white text-black border-none hover:bg-white/90">
                                Download Logo
                            </Button>
                        </a>
                    </div>
                </section>
            </main>
        </>
    );
}
