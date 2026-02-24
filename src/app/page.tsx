import Link from "next/link";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";


export default function Home() {
  const { hero, tools, features } = siteConfig.home;

  return (
    <main className="flex min-h-screen flex-col animate-fade-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-12 md:pt-32 md:pb-24">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,#F8FAFC_0%,#EEF2FF_50%,#F8FAFC_100%)]"></div>
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            {/* Trusted Badge */}
            <div className="mb-8 inline-flex items-center rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Icon name="shield" size={16} className="mr-2" />
              {hero.trustedText}
            </div>

            <h1 className="mb-6 text-xl md:text-2xl font-bold tracking-tight text-foreground">
              {hero.title.replace("made simple", "")}
              <span className="bg-gradient-to-r from-[hsl(187,72%,42%)] to-[hsl(200,80%,45%)] bg-clip-text text-transparent">
                made simple
              </span>
            </h1>
            <p className="mb-10 text-sm md:text-base font-medium text-muted-foreground max-w-2xl mx-auto">
              {hero.subtitle}
            </p>

            <div className="flex flex-col justify-center gap-4 sm:flex-row mb-12">
              <Button href="/#tools" variant="primary" className="h-14 px-8 text-lg w-full sm:w-auto">
                {hero.ctaPrimary}
              </Button>
              <Button href="/#tools" variant="secondary" className="h-14 px-8 text-lg w-full sm:w-auto">
                {hero.ctaSecondary}
              </Button>
            </div>

            {/* Hero Features */}
            <div className="flex flex-wrap justify-center gap-6 md:gap-12 text-sm font-medium text-text-secondary">
              {hero.benefits.map((benefit, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Icon name="check" size={18} className="text-primary" />
                  {benefit}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section id="tools" className="py-20 md:py-32 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="mb-4 text-xl md:text-2xl font-bold tracking-tight text-foreground">
              {tools.title}
            </h2>
            <p className="text-sm md:text-base font-medium text-muted-foreground">
              {tools.subtitle}
            </p>
          </div>


          {/* Image Tools Section */}
          <div className="mb-20">
            <div className="flex items-center gap-3 mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon name="image" size={20} />
              </div>
              <h3 className="text-lg md:text-xl font-bold tracking-tight text-foreground">Image Tools</h3>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {tools.image.map((tool) => (
                <Link key={tool.title} href={tool.href} className="group relative flex flex-col rounded-2xl border border-border bg-surface p-6 transition-all hover:shadow-subtle hover:-translate-y-1 hover:border-primary/50">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/5 text-primary group-hover:bg-primary/10 transition-colors">
                    <Icon name={tool.icon} size={24} />
                  </div>
                  <h3 className="mb-2 text-base md:text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                    {tool.title}
                  </h3>
                  <p className="mb-4 text-xs md:text-sm text-muted-foreground leading-relaxed flex-grow">
                    {tool.description}
                  </p>
                  <div className="flex items-center text-sm font-semibold text-primary">
                    Try Now <Icon name="arrow-right" size={14} className="ml-2 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* PDF Tools Section */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 text-red-600">
                <Icon name="file-text" size={20} />
              </div>
              <h3 className="text-lg md:text-xl font-bold tracking-tight text-foreground">PDF Tools</h3>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {tools.pdf.map((tool) => (
                <Link key={tool.title} href={tool.href} className="group relative flex flex-col rounded-2xl border border-border bg-surface p-6 transition-all hover:shadow-subtle hover:-translate-y-1 hover:border-red-500/50">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/5 text-red-600 group-hover:bg-red-500/10 transition-colors">
                    <Icon name={tool.icon} size={24} />
                  </div>
                  <h3 className="mb-2 text-base md:text-lg font-semibold text-foreground group-hover:text-red-600 transition-colors">
                    {tool.title}
                  </h3>
                  <p className="mb-4 text-xs md:text-sm text-muted-foreground leading-relaxed flex-grow">
                    {tool.description}
                  </p>
                  <div className="flex items-center text-sm font-semibold text-red-600">
                    Try Now <Icon name="arrow-right" size={14} className="ml-2 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features/Benefits Section */}
      <section className="py-20 md:py-32 bg-secondary/30 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
            {features.items.map((feature, i) => (
              <div key={i} className="flex flex-col gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white border border-border text-foreground shadow-sm">
                  <Icon name={feature.icon as string} size={24} />
                </div>
                <div>
                  <h3 className="mb-2 text-base md:text-lg font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
