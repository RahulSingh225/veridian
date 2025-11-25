import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/ads.txt", "/sitemap.xml"],
    },
    sitemap: "https://veridian.buzz/sitemap.xml",
  };
}
