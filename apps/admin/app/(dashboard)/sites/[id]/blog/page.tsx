import Link from "next/link";
import { getApiClient } from "@/lib/api";
import { BlogPostActions } from "./blog-post-actions";
import type { TBlogPost } from "@repo/sdk";

export default async function BlogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: siteId } = await params;
  const api = getApiClient();

  let posts: TBlogPost[] = [];
  try {
    const data = await api.blog.listPosts(siteId);
    posts = data.data;
  } catch {
    // API unavailable
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/sites/${siteId}`} className="text-sm text-[var(--muted-foreground)] hover:underline">
            Site
          </Link>
          <span className="text-[var(--muted-foreground)]">/</span>
          <h1 className="text-2xl font-bold">Blog</h1>
        </div>
        <Link
          href={`/sites/${siteId}/blog/new`}
          className="rounded bg-[var(--primary)] px-4 py-2 text-sm text-[var(--primary-foreground)] hover:opacity-90"
        >
          New post
        </Link>
      </div>

      {posts.length === 0 ? (
        <p className="mt-8 text-sm text-[var(--muted-foreground)]">No posts yet.</p>
      ) : (
        <table className="mt-6 w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-left text-xs text-[var(--muted-foreground)]">
              <th className="pb-2 pr-4">Title</th>
              <th className="pb-2 pr-4">Slug</th>
              <th className="pb-2 pr-4">Status</th>
              <th className="pb-2 pr-4">Published</th>
              <th className="pb-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className="border-b border-[var(--border)]">
                <td className="py-3 pr-4 font-medium">
                  <Link href={`/sites/${siteId}/blog/${post.id}`} className="hover:underline">
                    {post.title}
                  </Link>
                </td>
                <td className="py-3 pr-4 font-mono text-xs text-[var(--muted-foreground)]">{post.slug}</td>
                <td className="py-3 pr-4">
                  <span
                    className={`text-xs font-medium ${post.status === "published" ? "text-green-600" : "text-[var(--muted-foreground)]"}`}
                  >
                    {post.status}
                  </span>
                </td>
                <td className="py-3 pr-4 text-xs text-[var(--muted-foreground)]">
                  {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : "—"}
                </td>
                <td className="py-3">
                  <BlogPostActions postId={post.id} status={post.status} siteId={siteId} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
