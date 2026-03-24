import { MetadataRoute } from "next";
import { blogPosts } from "@/data/blog";
import fs from "fs";
import path from "path";

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = "https://aurafile.net";
    const lastModDate = new Date("2026-03-23");

    // Dynamic Blog Map
    const blogs: MetadataRoute.Sitemap = blogPosts.map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: new Date(post.date),
        changeFrequency: "monthly",
        priority: 0.8,
    }));

    // Dynamic Tools Discovery
    const appDir = path.join(process.cwd(), "src", "app");
    const nonToolDirs = new Set([
        "about", "about-us", "api", "blog", "contact", 
        "disclaimer", "document-tools", "faq", "image-tools", 
        "pdf-tools", "privacy", "privacy-policy", "search", 
        "security", "sitemap-html", "terms", "terms-of-service"
    ]);

    let toolSubDirs: string[] = [];
    try {
        const allItems = fs.readdirSync(appDir, { withFileTypes: true });
        toolSubDirs = allItems
            .filter((dirent) => dirent.isDirectory())
            .filter((dirent) => !dirent.name.startsWith("_") && !dirent.name.startsWith("("))
            .filter((dirent) => !nonToolDirs.has(dirent.name))
            .filter((dirent) => fs.existsSync(path.join(appDir, dirent.name, "page.tsx")))
            .map((dirent) => dirent.name);
    } catch (error) {
        console.error("Error reading src/app directory for sitemap generation:", error);
    }

    const dynamicTools: MetadataRoute.Sitemap = toolSubDirs.map((toolName) => ({
        url: `${baseUrl}/${toolName}`,
        lastModified: lastModDate,
        changeFrequency: "monthly",
        priority: 0.9,
    }));

    return [
        {
            url: baseUrl,
            lastModified: lastModDate,
            changeFrequency: "monthly",
            priority: 1.0,
        },
        ...blogs,
        ...dynamicTools,
        // Legal pages
        {
            url: `${baseUrl}/privacy-policy`,
            lastModified: lastModDate,
            changeFrequency: "yearly",
            priority: 0.3,
        },
        {
            url: `${baseUrl}/terms-of-service`,
            lastModified: lastModDate,
            changeFrequency: "yearly",
            priority: 0.3,
        },
        {
            url: `${baseUrl}/about-us`,
            lastModified: lastModDate,
            changeFrequency: "yearly",
            priority: 0.7,
        },
    ];
}
