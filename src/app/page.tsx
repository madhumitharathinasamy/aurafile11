import Link from "next/link";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";


export default function Home() {
  const { hero, tools, features } = siteConfig.home;

  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-8 md:pt-24 md:pb-12">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(var(--primary-rgb),0.08)_0%,transparent_70%)] opacity-40"></div>
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-4xl font-extrabold tracking-tight md:text-6xl lg:text-7xl">
              <span className="bg-gradient-to-br from-primary to-[#8e1c90] bg-clip-text text-transparent">
                {hero.title}
              </span>
            </h1>
            <p className="mb-10 text-xl text-muted md:text-2xl leading-relaxed">
              {hero.subtitle}
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button href="/tools" variant="primary" className="h-12 w-full px-8 text-lg sm:w-auto">
                {hero.cta}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold md:text-4xl text-foreground">
            Powerful <span className="text-accent">Image Tools</span>
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tools.items.map((tool) => (
              <Card
                key={tool.title}
                title={tool.title}
                description={tool.description}
                href={tool.href}
                icon={<Icon name={tool.icon} size={32} color="var(--primary)" />}
              // We will need to update Card component to accept className or ensure it renders correctly
              />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 md:py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold md:text-4xl text-foreground">How It Works</h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              { title: "Upload", desc: "Select and upload your image securely.", icon: "upload" },
              { title: "Process", desc: "Our powerful tools process your files instantly.", icon: "settings" },
              { title: "Download", desc: "Get your optimized images in seconds.", icon: "download" }
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center p-6 bg-surface/50 rounded-2xl border border-border/50 w-full max-w-full">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-accent shadow-sm">
                  <Icon name={step.icon} size={32} />
                </div>
                <h3 className="mb-3 text-xl font-bold text-foreground">{step.title}</h3>
                <p className="text-muted leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-secondary/30 border-t border-border">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold md:text-4xl text-foreground">{features.title}</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.items.map((feature) => (
              <Card
                key={feature.title}
                title={feature.title}
                description={feature.description}
                icon={<Icon name={feature.icon as string} size={32} color="var(--accent)" />}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
