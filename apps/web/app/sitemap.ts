import type { MetadataRoute } from "next";

import { getBlogPosts } from "@/lib/api";
import { siteConfig } from "@/lib/site-data";

const staticRoutes = [
  { path: "", priority: 1.0 },
  { path: "/about", priority: 0.8 },
  { path: "/services", priority: 0.8 },
  { path: "/pricing", priority: 0.8 },
  { path: "/portfolio", priority: 0.7 },
  { path: "/team", priority: 0.7 },
  { path: "/blog", priority: 0.7 },
  { path: "/testimonials", priority: 0.6 },
  { path: "/contact", priority: 0.9 },
  { path: "/status", priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getBlogPosts().catch(() => []);
  const publishedPosts = posts.filter((p) => p.status === "published");

  return [
    ...staticRoutes.map(({ path, priority }) => ({
      url: `${siteConfig.url}${path}`,
      changeFrequency: "weekly" as const,
      priority,
      lastModified: new Date("2026-01-01"),
    })),
    ...publishedPosts.map((post) => ({
      url: `${siteConfig.url}/blog/${post.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
      lastModified: post.updatedAt ? new Date(post.updatedAt) : new Date("2026-01-01"),
    })),
  ];
}
