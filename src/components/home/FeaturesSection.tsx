import { siteConfig } from "@/config/site";
import { Icon } from "@/components/ui/Icon";

export default function FeaturesSection() {
  const { features } = siteConfig.home;

  return (
    <section id="features" className="py-20 md:py-24 bg-[#c4cdd6]">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4 max-w-[var(--container-width)] mx-auto text-center">
          {features.items.map((feature: any, i: number) => (
            <div key={i} className="flex flex-col items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center text-[#0081C9]">
                <Icon name={feature.icon as string} size={32} strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="mb-3 font-bold text-slate-900 text-lg">{feature.title}</h3>
                <p className="text-sm font-medium text-slate-800 leading-relaxed max-w-[250px] mx-auto">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
