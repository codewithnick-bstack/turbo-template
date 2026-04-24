import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { serverFetch } from "@/lib/api";
import type { BlogPost } from "@/lib/types";
import { BlogForm } from "../blog-form";

export const metadata: Metadata = { title: "Edit Post" };

export default async function EditBlogPostPage({ params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;

  let post: BlogPost;
  try {
    post = await serverFetch<BlogPost>(`/blog/${postId}`);
  } catch {
    notFound();
  }

  return (
    <div className="max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold">Edit post</h1>
      <BlogForm post={post} />
    </div>
  );
}
