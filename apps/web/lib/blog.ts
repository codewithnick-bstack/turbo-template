import React, { cache, type ComponentPropsWithoutRef } from "react";
import fs from "node:fs/promises";
import path from "node:path";

import matter from "gray-matter";
import { compileMDX } from "next-mdx-remote/rsc";

const postsDirectory = path.join(process.cwd(), "content", "posts");

export type PostMeta = {
  title: string;
  description: string;
  date: string;
  author: string;
  category: string;
  slug: string;
  readingTime: string;
};

export const getAllPosts = cache(async (): Promise<PostMeta[]> => {
  const files = await fs.readdir(postsDirectory);

  const posts = await Promise.all(
    files
      .filter((file) => file.endsWith(".mdx"))
      .map(async (file) => {
        const source = await fs.readFile(path.join(postsDirectory, file), "utf8");
        const { data } = matter(source);

        return {
          title: data.title,
          description: data.description,
          date: data.date,
          author: data.author,
          category: data.category,
          readingTime: data.readingTime,
          slug: file.replace(/\.mdx$/, ""),
        } as PostMeta;
      }),
  );

  return posts.sort((a, b) => +new Date(b.date) - +new Date(a.date));
});

export async function getPostBySlug(slug: string) {
  const fullPath = path.join(postsDirectory, `${slug}.mdx`);
  const source = await fs.readFile(fullPath, "utf8");
  const { data, content } = matter(source);

  const compiled = await compileMDX<PostMeta>({
    source: content,
    options: { parseFrontmatter: false },
    components: {
      h2: (props: ComponentPropsWithoutRef<"h2">) =>
        React.createElement("h2", { className: "mt-10 text-2xl font-semibold tracking-tight", ...props }),
      p: (props: ComponentPropsWithoutRef<"p">) =>
        React.createElement("p", { className: "mt-4 leading-7 text-slate-700 dark:text-slate-300", ...props }),
      ul: (props: ComponentPropsWithoutRef<"ul">) =>
        React.createElement("ul", {
          className: "mt-4 list-disc space-y-2 pl-5 text-slate-700 dark:text-slate-300",
          ...props,
        }),
      li: (props: ComponentPropsWithoutRef<"li">) => React.createElement("li", props),
      strong: (props: ComponentPropsWithoutRef<"strong">) =>
        React.createElement("strong", { className: "font-semibold text-slate-900 dark:text-white", ...props }),
    },
  });

  return {
    meta: {
      ...(data as Omit<PostMeta, "slug">),
      slug,
    },
    content: compiled.content,
  };
}
