import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { MDXRemote } from "next-mdx-remote/rsc";

import { Badge } from "@/components/ui/badge";
import { getBlogPost, getBlogPosts } from "@/lib/api";
import { siteConfig } from "@/lib/site-data";

function isHtml(content: string) {
  return /^\s*</.test(content);
}

export async function generateStaticParams() {
  const posts = await getBlogPosts().catch(() => []);
  return posts
    .filter((p) => p.status === "published")
    .map((p) => ({ slug: p.slug }));
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
    return { alternates: { canonical: "/blog" } };
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let post;
  try {
    post = await getBlogPost(slug);
  } catch {
    notFound();
  }

  if (post.status !== "published") notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt ?? undefined,
    author: post.author
      ? { "@type": "Person", name: post.author }
      : { "@type": "Organization", name: siteConfig.name },
    datePublished: post.publishedAt ?? undefined,
    dateModified: post.updatedAt ?? post.publishedAt ?? undefined,
    url: `${siteConfig.url}/blog/${post.slug}`,
    wordCount: post.content ? post.content.split(/\s+/).length : undefined,
    publisher: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
  };

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {post.author ? <Badge>{post.author}</Badge> : null}
      <h1 className="mt-4 text-4xl font-semibold tracking-tight">{post.title}</h1>
      {post.publishedAt ? (
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          {format(new Date(post.publishedAt), "MMMM d, yyyy")}
        </p>
      ) : null}
      {post.excerpt ? (
        <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">{post.excerpt}</p>
      ) : null}
      <div className="prose prose-slate mt-10 max-w-none dark:prose-invert [&_iframe]:w-full [&_iframe]:rounded-lg [&_.iframe-wrapper]:w-full">
        {post.content
          ? isHtml(post.content)
            ? <div dangerouslySetInnerHTML={{ __html: post.content }} />
            : <MDXRemote source={post.content} />
          : null}
      </div>
    </article>
  );
}
