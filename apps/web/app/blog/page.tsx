import type { Metadata } from "next";
import Link from "next/link";
import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getAllPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description: "MDX-powered blog posts for your agency, business, or portfolio site.",
};

export default async function BlogPage() {
  const posts = await getAllPosts();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <Badge>Blog</Badge>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight">Helpful articles, launch notes, and SEO content</h1>
      <div className="mt-8 grid gap-4">
        {posts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`}>
            <Card className="transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span>{post.category}</span>
                <span>•</span>
                <span>{format(new Date(post.date), "MMM d, yyyy")}</span>
                <span>•</span>
                <span>{post.readingTime}</span>
              </div>
              <h2 className="mt-3 text-2xl font-semibold">{post.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{post.description}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
