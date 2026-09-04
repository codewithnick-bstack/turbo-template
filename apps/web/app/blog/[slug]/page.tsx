import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { MDXRemote } from "next-mdx-remote/rsc";

import { BlogReadTracker } from "@/components/blog-read-tracker";
import { Reveal } from "@/components/reveal";
import { Rule } from "@/components/rule";
import { Section, Container } from "@/components/section";
import { StaggerWords } from "@/components/stagger-words";
import { TextLink } from "@/components/cta";
import { getBlogPost, getBlogPosts } from "@/lib/api";
import { getSampleBlogPost, sampleBlogPosts, type SampleBlogPost } from "@/lib/sample-content";
import { siteConfig } from "@/lib/site-data";
import type { BlogPost } from "@/lib/types";

function isHtml(content: string) {
  return /^\s*</.test(content);
}

/** Normalised article shape both the API post and the sample post render through. */
type Article = {
  slug: string;
  title: string;
  dek: string | null;
  author: string | null;
  date: string | null;
  readingTime: number;
  coverSrc: string;
  coverAlt: string;
  /** Rendered body — either raw HTML/MDX from the API, or plain paragraphs. */
  html: string | null;
  mdx: string | null;
  paragraphs: string[] | null;
};

function fromApi(post: BlogPost): Article {
  const wordCount = post.content ? post.content.split(/\s+/).length : 0;
  return {
    slug: post.slug,
    title: post.title,
    dek: post.excerpt,
    author: post.author,
    date: post.publishedAt,
    readingTime: Math.max(1, Math.ceil(wordCount / 200)),
    coverSrc: post.coverImageUrl ?? "/photos/plans.jpg",
    coverAlt: post.title,
    html: post.content && isHtml(post.content) ? post.content : null,
    mdx: post.content && !isHtml(post.content) ? post.content : null,
    paragraphs: null,
  };
}

function fromSample(post: SampleBlogPost): Article {
  return {
    slug: post.slug,
    title: post.title,
    dek: post.dek,
    author: post.category,
    date: post.date,
    readingTime: post.readingTime,
    coverSrc: post.cover.src,
    coverAlt: post.cover.alt,
    html: null,
    mdx: null,
    paragraphs: post.body,
  };
}

export async function generateStaticParams() {
  const posts = await getBlogPosts().catch(() => []);
  const source = posts.length > 0 ? posts.filter((p) => p.status === "published") : sampleBlogPosts;
  return source.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await getBlogPost(slug);
    const title = post.metaTitle ?? post.title;
    const description = post.metaDescription ?? post.excerpt ?? undefined;
    return {
      title,
      description,
      alternates: { canonical: `/blog/${slug}` },
      openGraph: {
        title,
        description,
        url: `/blog/${slug}`,
        siteName: siteConfig.name,
        type: "article",
        publishedTime: post.publishedAt ?? undefined,
        authors: post.author ? [post.author] : undefined,
        images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: title }],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: title }],
      },
    };
  } catch {
    const sample = getSampleBlogPost(slug);
    if (!sample) return { alternates: { canonical: "/blog" } };
    return {
      title: sample.title,
      description: sample.dek,
      alternates: { canonical: `/blog/${slug}` },
      openGraph: {
        title: sample.title,
        description: sample.dek,
        url: `/blog/${slug}`,
        siteName: siteConfig.name,
        type: "article",
        publishedTime: sample.date,
        images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: sample.title }],
      },
      twitter: {
        card: "summary_large_image",
        title: sample.title,
        description: sample.dek,
        images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: sample.title }],
      },
    };
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let article: Article | null = null;
  try {
    const post = await getBlogPost(slug);
    if (post.status === "published") article = fromApi(post);
  } catch {
    // fall through to sample content below
  }

  let nextSlug: string | null = null;
  let nextTitle: string | null = null;

  if (!article) {
    const sample = getSampleBlogPost(slug);
    if (!sample) notFound();
    article = fromSample(sample);
    const idx = sampleBlogPosts.findIndex((p) => p.slug === slug);
    const next = sampleBlogPosts[(idx + 1) % sampleBlogPosts.length];
    if (next && next.slug !== slug) {
      nextSlug = next.slug;
      nextTitle = next.title;
    }
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.dek ?? undefined,
    author: article.author
      ? { "@type": "Person", name: article.author }
      : { "@type": "Organization", name: siteConfig.name },
    datePublished: article.date ?? undefined,
    url: `${siteConfig.url}/blog/${article.slug}`,
    publisher: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
  };

  // Pull one paragraph out as a pull-quote when we have plain-paragraph body
  // copy (sample posts). The second paragraph reads best mid-article.
  const pullQuoteIndex = article.paragraphs && article.paragraphs.length > 2 ? 1 : -1;

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogReadTracker slug={article.slug} />

      {/* Cover band, same pattern as PageHero. */}
      <section className="on-dark relative isolate overflow-hidden bg-[var(--navy)] py-20 text-white lg:py-28">
        <Image
          src={article.coverSrc}
          alt={article.coverAlt}
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-t from-[var(--navy-deep)] via-[var(--navy)]/75 to-[var(--navy)]/35"
        />
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <Rule />
            {article.author ? <p className="eyebrow mt-6 text-white/60">{article.author}</p> : null}
          </Reveal>
          <StaggerWords
            as="h1"
            text={article.title}
            className="font-display mt-5 text-3xl font-bold tracking-[-0.02em] text-balance sm:text-5xl"
          />
          <Reveal index={1} className="mt-5 flex flex-wrap gap-3 text-sm text-white/70">
            <span>
              {article.date ? format(new Date(article.date), "MMMM d, yyyy") : null}
            </span>
            {article.date ? <span>·</span> : null}
            <span>{article.readingTime} min read</span>
          </Reveal>
        </div>
      </section>

      <Section space="normal">
        <Container measure="narrow">
          {article.dek ? (
            <p className="text-lg leading-8 text-[var(--muted)]">{article.dek}</p>
          ) : null}

          {article.paragraphs ? (
            <div className="prose prose-lg mt-10 max-w-none text-[var(--foreground)] dark:prose-invert">
              {article.paragraphs.map((paragraph, index) =>
                index === pullQuoteIndex ? (
                  <blockquote
                    key={index}
                    className="font-display my-10 border-none pl-0 text-2xl font-semibold text-balance text-[var(--navy)] italic dark:text-white"
                  >
                    &ldquo;{paragraph}&rdquo;
                  </blockquote>
                ) : (
                  <p key={index}>{paragraph}</p>
                ),
              )}
            </div>
          ) : (
            <div className="prose prose-lg mt-10 max-w-none text-[var(--foreground)] dark:prose-invert [&_iframe]:w-full [&_iframe]:rounded-lg [&_.iframe-wrapper]:w-full">
              {article.html ? (
                <div dangerouslySetInnerHTML={{ __html: article.html }} />
              ) : article.mdx ? (
                <MDXRemote source={article.mdx} />
              ) : null}
            </div>
          )}

          <div className="mt-14 border-t border-[var(--border)] pt-8">
            <TextLink href="/blog" label="Back to the blog" />
          </div>
        </Container>
      </Section>

      {nextSlug && nextTitle ? (
        <Section tone="muted" bordered>
          <Container>
            <p className="eyebrow">More from the desk</p>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <Reveal>
                <Link
                  href={`/blog/${nextSlug}`}
                  className="group block border border-[var(--border)] bg-[var(--card)] p-6 transition-colors duration-[var(--duration-micro)] hover:bg-[var(--background)]"
                >
                  <h3 className="font-display text-lg font-semibold text-[var(--navy)] dark:text-white">
                    {nextTitle}
                  </h3>
                  <span className="mt-3 inline-block text-xs font-bold tracking-[0.1em] text-[var(--accent-text)] uppercase">
                    Read next
                  </span>
                </Link>
              </Reveal>
              <Reveal index={1}>
                <Link
                  href="/blog"
                  className="group flex h-full flex-col justify-center border border-[var(--border)] bg-[var(--card)] p-6 transition-colors duration-[var(--duration-micro)] hover:bg-[var(--background)]"
                >
                  <h3 className="font-display text-lg font-semibold text-[var(--navy)] dark:text-white">
                    See every post
                  </h3>
                  <span className="mt-3 inline-block text-xs font-bold tracking-[0.1em] text-[var(--accent-text)] uppercase">
                    All articles
                  </span>
                </Link>
              </Reveal>
            </div>
          </Container>
        </Section>
      ) : null}
    </article>
  );
}
