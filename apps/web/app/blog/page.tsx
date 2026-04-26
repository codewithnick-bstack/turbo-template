import { Suspense } from "react";
import type { Metadata } from "next";
import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { BlogPostLink } from "@/components/blog-post-link";
import { Card } from "@/components/ui/card";
import { getBlogPosts } from "@/lib/api";
import { siteConfig } from "@/lib/site-data";

const blogJsonLd = {
  "@context": "https://schema.org",
  "@type": "Blog",
  name: "Blog",
  description: "Articles, insights, and updates from our team.",
  url: `${siteConfig.url}/blog`,
  publisher: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
};

export const metadata: Metadata = {
  title: "Blog",
  description: "Articles, insights, and updates from our team.",
  alternates: {
    canonical: "/blog",
    types: { "application/rss+xml": `${siteConfig.url}/blog/feed.xml` },
  },
  openGraph: {
    title: "Blog",
    description: "Articles, insights, and updates from our team.",
    url: "/blog",
    siteName: siteConfig.name,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Blog" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog",
    description: "Articles, insights, and updates from our team.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Blog" }],
  },
};

async function BlogPostsList() {
  const posts = await getBlogPosts().catch(() => []);

  if (posts.length === 0) {
    return <p className="text-slate-500 dark:text-slate-400">No posts yet. Check back soon.</p>;
  }

  return (
    <>
      {posts.map((post) => (
        <BlogPostLink key={post.slug} href={`/blog/${post.slug}`} slug={post.slug} title={post.title}>
          <Card className="transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              {post.author ? <span>{post.author}</span> : null}
              {post.author && post.publishedAt ? <span>•</span> : null}
              {post.publishedAt ? <span>{format(new Date(post.publishedAt), "MMM d, yyyy")}</span> : null}
            </div>
            <h2 className="mt-3 text-2xl font-semibold">{post.title}</h2>
            {post.excerpt ? (
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{post.excerpt}</p>
            ) : null}
          </Card>
        </BlogPostLink>
      ))}
    </>
  );
}

function BlogSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-32 rounded-[2rem] bg-slate-200 dark:bg-slate-800" />
      ))}
    </div>
  );
}

export default function BlogPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }} />
      <Badge>Blog</Badge>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight">Insights, updates, and useful reads</h1>
      <div className="mt-8 grid gap-4">
        <Suspense fallback={<BlogSkeleton />}>
          <BlogPostsList />
        </Suspense>
      </div>
    </div>
  );
}
