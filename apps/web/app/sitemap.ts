import type { MetadataRoute } from "next";

import { getAllPosts } from "@/lib/blog";
import { siteConfig } from "@/lib/site-data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPosts();
  const routes = ["", "/about", "/services", "/portfolio", "/blog", "/contact"];

  return [
    ...routes.map((route) => ({
      url: `${siteConfig.url}${route}`,
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : 0.7,
      lastModified: new Date(),
    })),
    ...posts.map((post) => ({
      url: `${siteConfig.url}/blog/${post.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
      lastModified: new Date(post.date),
    })),
  ];
}
