import { Suspense } from "react";
import type { Metadata } from "next";
import { format } from "date-fns";

import { BlogPostLink } from "@/components/blog-post-link";
import { PageHero } from "@/components/page-hero";
import { photos } from "@/lib/photos";
import { Reveal } from "@/components/reveal";
import { Section, Container } from "@/components/section";
import { getBlogPosts } from "@/lib/api";
import { siteConfig } from "@/lib/site-data";

const blogJsonLd = {
  "@context": "https://schema.org",
  "@type": "Blog",
  name: "Blog",
  description: "Articles, insights, and updates from our team.",
  url: `${siteConfig.url}/blog`,
  publisher: {
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
  },
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
    images: [
      { url: "/opengraph-image", width: 1200, height: 630, alt: "Blog" },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog",
    description: "Articles, insights, and updates from our team.",
    images: [
      { url: "/opengraph-image", width: 1200, height: 630, alt: "Blog" },
    ],
  },
};

async function BlogPostsList() {
  const posts = await getBlogPosts().catch(() => []);

  if (posts.length === 0) {
    return (
      <p className="text-[var(--muted)]">No posts yet. Check back soon.</p>
    );
  }

  return (
    <div className="grid gap-px bg-[var(--border)] sm:grid-cols-2">
      {posts.map((post, index) => (
        <Reveal key={post.slug} index={index}>
          <BlogPostLink
            href={`/blog/${post.slug}`}
            slug={post.slug}
            title={post.title}
            className="group flex h-full flex-col bg-[var(--background)] p-8 transition-colors duration-[var(--duration-micro)] hover:bg-[var(--muted-bg)]"
          >
            <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]">
              {post.author ? <span>{post.author}</span> : null}
              {post.author && post.publishedAt ? <span>·</span> : null}
              {post.publishedAt ? (
                <span>{format(new Date(post.publishedAt), "MMM d, yyyy")}</span>
              ) : null}
            </div>
            <h2 className="font-display mt-3 text-2xl font-semibold text-[var(--navy)] dark:text-white">
              {post.title}
            </h2>
            {post.excerpt ? (
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                {post.excerpt}
              </p>
            ) : null}
          </BlogPostLink>
        </Reveal>
      ))}
    </div>
  );
}

function BlogSkeleton() {
  return (
    <div className="grid animate-pulse gap-px bg-[var(--border)] sm:grid-cols-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-40 bg-[var(--background)]" />
      ))}
    </div>
  );
}

export default function BlogPage() {
  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />
      <PageHero
        image={photos.plans}
        eyebrow="Blog"
        title="Insights, updates, and useful reads."
        intro="Notes on the construction and infrastructure labor market, from the desk that's been placing people on it for 41 years."
      />
      <Section>
        <Container measure="full">
          <Suspense fallback={<BlogSkeleton />}>
            <BlogPostsList />
          </Suspense>
        </Container>
      </Section>
    </div>
  );
}
