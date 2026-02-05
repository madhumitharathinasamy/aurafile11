import { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: ["/api/", "/admin/"], // Protect generic private routes if they existed
        },
        sitemap: `https://${siteConfig.domain}/sitemap.xml`,
    };
}
