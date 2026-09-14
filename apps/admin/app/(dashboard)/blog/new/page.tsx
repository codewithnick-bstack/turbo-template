import type { Metadata } from "next";
import { BlogForm } from "../blog-form";

export const metadata: Metadata = { title: "New Post" };

export default function NewBlogPostPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold">New post</h1>
      <BlogForm />
    </div>
  );
}
