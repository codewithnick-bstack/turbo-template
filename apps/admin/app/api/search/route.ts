import { NextResponse } from "next/server";
import { serverFetch } from "@/lib/api";

type BlogPost = { id: string; slug: string; title: string };
type TeamMember = { id: string; name: string; title: string };
type PortfolioEntry = { id: string; title: string };

type SearchResult = { id: string; kind: string; title: string; url: string };

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();

  if (!q) return NextResponse.json({ data: [] });

  const encoded = encodeURIComponent(q);

  const [blogRes, teamRes, portfolioRes] = await Promise.allSettled([
    serverFetch<BlogPost[]>(`/blog?search=${encoded}&limit=4`),
    serverFetch<TeamMember[]>(`/team?search=${encoded}&limit=4`),
    serverFetch<PortfolioEntry[]>(`/portfolio?search=${encoded}&limit=4`),
  ]);

  const results: SearchResult[] = [];

  if (blogRes.status === "fulfilled") {
    for (const post of blogRes.value.slice(0, 4)) {
      results.push({ id: post.id, kind: "blog", title: post.title, url: `/blog/${post.id}` });
    }
  }
  if (teamRes.status === "fulfilled") {
    for (const member of teamRes.value.slice(0, 4)) {
      results.push({ id: member.id, kind: "team", title: `${member.name} — ${member.title}`, url: `/team` });
    }
  }
  if (portfolioRes.status === "fulfilled") {
    for (const entry of portfolioRes.value.slice(0, 4)) {
      results.push({ id: entry.id, kind: "portfolio", title: entry.title, url: `/portfolio` });
    }
  }

  return NextResponse.json({ data: results.slice(0, 10) });
}
