import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { getAllPosts, getPostBySlug } from "@/lib/blog";

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;

  try {
    const post = await getPostBySlug(slug);
    return {
      title: post.meta.title,
      description: post.meta.description,
      alternates: {
        canonical: `/blog/${slug}`,
      },
    };
  } catch {
    return {};
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  try {
    const post = await getPostBySlug(slug);

    return (
      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <Badge>{post.meta.category}</Badge>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">{post.meta.title}</h1>
        <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-500 dark:text-slate-400">
          <span>{post.meta.author}</span>
          <span>•</span>
          <span>{format(new Date(post.meta.date), "MMMM d, yyyy")}</span>
          <span>•</span>
          <span>{post.meta.readingTime}</span>
        </div>
        <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">{post.meta.description}</p>
        <div className="prose prose-slate mt-10 max-w-none dark:prose-invert">{post.content}</div>
      </article>
    );
  } catch {
    notFound();
  }
}
