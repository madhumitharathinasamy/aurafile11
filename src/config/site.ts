export const siteConfig = {
    name: "Aura File",
    domain: "aurafile.net",
    description: "Secure, fast, and private image tools for everyone.",
    links: {
        github: "https://github.com/aurafile", // Placeholder
        twitter: "https://twitter.com/aurafile", // Placeholder
    },
    keywords: [
        "image tools",
        "resize image",
        "compress image",
        "convert image",
        "secure image processing",
        "free online image tools",
    ],
    authors: [
        {
            name: "Aura File Team",
            url: "https://aurafile.net",
        },
    ],
    creator: "Aura File Team",
    ogImage: "https://aurafile.net/og.jpg", // Placeholder until real image exists
    header: {
        nav: [
            { title: "Home", href: "/" },
            { title: "Tools", href: "/tools" },
            { title: "About", href: "/about" },
            { title: "Contact", href: "/contact" },
        ],
    },
    footer: {
        copyright: `© ${new Date().getFullYear()} Aura File. All rights reserved.`,
        legal: [
            { title: "Privacy Policy", href: "/privacy" },
            { title: "Terms of Service", href: "/terms" },
            { title: "About Us", href: "/about" },
            { title: "Contact", href: "/contact" },
        ],
    },
    home: {
        hero: {
            title: "Master Your Images.",
            subtitle: "Secure, fast, and free tools to resize, compress, and convert your images entirely in your browser.",
            cta: "Get Started",
        },
        tools: {
            title: "Powerful Image Tools",
            items: [
                { title: "Resize", description: "Resize images to exact dimensions.", href: "/tools/resize", icon: "resize" },
                { title: "Compress", description: "Reduce file size without losing quality.", href: "/tools/compress", icon: "compress" },
                { title: "Convert", description: "Convert between PNG, JPG, WEBP, and more.", href: "/tools/convert", icon: "convert" },
            ],
        },
        features: {
            title: "Why Choose Aura File?",
            items: [
                { title: "Privacy First", description: "All processing happens securely. Your images never leave your control.", icon: "shield" },
                { title: "Lightning Fast", description: "Powered by modern web technologies for instant results.", icon: "zap" },
                { title: "No Limits", description: "Free to use without arbitrary file size limits.", icon: "globe" },
            ],
        },
    },
};

export type SiteConfig = typeof siteConfig;
