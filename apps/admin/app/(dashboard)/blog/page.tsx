import type { Metadata } from "next";
import Link from "next/link";
import { format } from "date-fns";
import { serverFetch } from "@/lib/api";
import type { BlogPost } from "@/lib/types";

export const metadata: Metadata = { title: "Blog" };

export default async function BlogPage() {
  let posts: BlogPost[] = [];
  try {
    posts = await serverFetch<BlogPost[]>("/blog/admin/all");
  } catch {
    // API unavailable or not authenticated
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Blog</h1>
        <Link
          href="/blog/new"
          className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90"
        >
          New post
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-xl border border-[var(--border)] px-6 py-12 text-center">
          <p className="text-sm text-[var(--muted-foreground)]">No posts yet.</p>
          <Link href="/blog/new" className="mt-3 inline-block text-sm text-[var(--primary)] hover:underline">
            Write the first post →
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.id}`}
              className="flex items-center justify-between rounded-xl border border-[var(--border)] px-4 py-3 hover:bg-[var(--muted)] transition-colors"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{post.title}</p>
                {post.excerpt ? (
                  <p className="text-xs text-[var(--muted-foreground)] truncate mt-0.5">{post.excerpt}</p>
                ) : null}
              </div>
              <div className="ml-4 flex shrink-0 items-center gap-3">
                <span
                  className={`text-xs font-medium ${
                    post.status === "published" ? "text-green-600 dark:text-green-400" : "text-[var(--muted-foreground)]"
                  }`}
                >
                  {post.status}
                </span>
                <span className="text-xs text-[var(--muted-foreground)]">
                  {format(new Date(post.updatedAt), "MMM d, yyyy")}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
