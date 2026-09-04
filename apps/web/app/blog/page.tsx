import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { format } from "date-fns";

import { BlogPostLink } from "@/components/blog-post-link";
import { PageHero } from "@/components/page-hero";
import { photos } from "@/lib/photos";
import { Reveal } from "@/components/reveal";
import { Section, Container } from "@/components/section";
import { getBlogPosts } from "@/lib/api";
import { sampleBlogPosts, type SampleBlogPost } from "@/lib/sample-content";
import { siteConfig } from "@/lib/site-data";
import type { BlogPost } from "@/lib/types";

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

/** Normalised shape both the API post and the sample post render through. */
type DisplayPost = {
  slug: string;
  title: string;
  dek: string;
  date: string | null;
  readingTime: number | null;
  coverSrc: string;
  coverAlt: string;
  category: string | null;
};

function fromApi(post: BlogPost): DisplayPost {
  const wordCount = post.content ? post.content.split(/\s+/).length : 0;
  return {
    slug: post.slug,
    title: post.title,
    dek: post.excerpt ?? "",
    date: post.publishedAt,
    readingTime: wordCount > 0 ? Math.ceil(wordCount / 200) : null,
    coverSrc: post.coverImageUrl ?? photos.plans.src,
    coverAlt: post.title,
    category: post.author,
  };
}

function fromSample(post: SampleBlogPost): DisplayPost {
  return {
    slug: post.slug,
    title: post.title,
    dek: post.dek,
    date: post.date,
    readingTime: post.readingTime,
    coverSrc: post.cover.src,
    coverAlt: post.cover.alt,
    category: post.category,
  };
}

async function BlogPostsList() {
  const apiPosts = await getBlogPosts().catch(() => []);
  const posts: DisplayPost[] =
    apiPosts.length > 0 ? apiPosts.map(fromApi) : sampleBlogPosts.map(fromSample);

  const [featured, ...rest] = posts;
  if (!featured) return null;

  return (
    <div>
      {/* Featured post — full-width, photo left, copy right. */}
      <Reveal>
        <BlogPostLink
          href={`/blog/${featured.slug}`}
          slug={featured.slug}
          title={featured.title}
          className="group grid gap-6 border border-[var(--border)] bg-[var(--card)] sm:grid-cols-5"
        >
          <div className="relative aspect-[16/10] overflow-hidden sm:col-span-3 sm:aspect-auto">
            <Image
              src={featured.coverSrc}
              alt={featured.coverAlt}
              fill
              priority
              sizes="(min-width: 640px) 60vw, 100vw"
              className="object-cover transition-transform duration-300 ease-[var(--ease-standard)] group-hover:scale-[1.03]"
            />
          </div>
          <div className="flex flex-col justify-center p-8 sm:col-span-2 sm:p-10">
            {featured.category ? (
              <p className="eyebrow">{featured.category}</p>
            ) : null}
            <h2 className="font-display mt-4 text-2xl font-semibold text-[var(--navy)] sm:text-3xl dark:text-white">
              {featured.title}
            </h2>
            {featured.dek ? (
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                {featured.dek}
              </p>
            ) : null}
            <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]">
              {featured.date ? (
                <span>{format(new Date(featured.date), "MMM d, yyyy")}</span>
              ) : null}
              {featured.date && featured.readingTime ? <span>·</span> : null}
              {featured.readingTime ? <span>{featured.readingTime} min read</span> : null}
            </div>
          </div>
        </BlogPostLink>
      </Reveal>

      {rest.length > 0 ? (
        <div className="mt-px grid gap-px bg-[var(--border)] sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((post, index) => (
            <Reveal key={post.slug} index={index}>
              <BlogPostLink
                href={`/blog/${post.slug}`}
                slug={post.slug}
                title={post.title}
                className="group flex h-full flex-col bg-[var(--background)]"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={post.coverSrc}
                    alt={post.coverAlt}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    loading="lazy"
                    className="object-cover transition-transform duration-300 ease-[var(--ease-standard)] group-hover:scale-[1.03]"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  {post.category ? <p className="eyebrow">{post.category}</p> : null}
                  <h3 className="font-display mt-3 text-lg font-semibold text-[var(--navy)] dark:text-white">
                    {post.title}
                  </h3>
                  <div className="mt-auto flex flex-wrap items-center gap-2 pt-4 text-xs text-[var(--muted)]">
                    {post.date ? (
                      <span>{format(new Date(post.date), "MMM d, yyyy")}</span>
                    ) : null}
                    {post.date && post.readingTime ? <span>·</span> : null}
                    {post.readingTime ? <span>{post.readingTime} min read</span> : null}
                  </div>
                </div>
              </BlogPostLink>
            </Reveal>
          ))}
        </div>
      ) : null}
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
          <Suspense fallback={null}>
            <BlogPostsList />
          </Suspense>
        </Container>
      </Section>
    </div>
  );
}
