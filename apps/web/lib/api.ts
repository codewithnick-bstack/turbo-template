import type { BlogPost, ChatMessage, ContactPayload, PortfolioEntry, SiteSettings, TeamMember, Testimonial } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

async function apiFetch<T>(path: string, options?: RequestInit & { next?: { revalidate?: number } }): Promise<T> {
  const res = await fetch(`${API_URL}/api/v1${path}`, options);
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(body.message ?? `API error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export function getSettings() {
  return apiFetch<SiteSettings>("/settings", { next: { revalidate: 300 } });
}

export function getBlogPosts() {
  return apiFetch<BlogPost[]>("/blog", { next: { revalidate: 60 } });
}

export function getBlogPost(slug: string) {
  return apiFetch<BlogPost>(`/blog/${encodeURIComponent(slug)}`, { next: { revalidate: 60 } });
}

export function getTeam() {
  return apiFetch<TeamMember[]>("/team", { next: { revalidate: 300 } });
}

export function getTestimonials() {
  return apiFetch<Testimonial[]>("/testimonials", { next: { revalidate: 300 } });
}

export function getPortfolio() {
  return apiFetch<PortfolioEntry[]>("/portfolio", { next: { revalidate: 300 } });
}

export function getPortfolioEntry(id: string) {
  return apiFetch<PortfolioEntry>(`/portfolio/${encodeURIComponent(id)}`, { next: { revalidate: 300 } });
}

export function searchContent(query: string) {
  const q = encodeURIComponent(query.slice(0, 200));
  return Promise.all([
    apiFetch<BlogPost[]>(`/blog?search=${q}`, { cache: "no-store" }).catch(() => [] as BlogPost[]),
    apiFetch<PortfolioEntry[]>(`/portfolio?search=${q}`, { cache: "no-store" }).catch(() => [] as PortfolioEntry[]),
  ]);
}

export async function submitContact(data: ContactPayload) {
  const res = await fetch(`${API_URL}/api/v1/contacts`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(body.message ?? "Failed to submit contact form");
  }
  return res.json() as Promise<{ id: string; message: string }>;
}

export async function chatWithSite(messages: ChatMessage[]) {
  const res = await fetch(`${API_URL}/api/v1/ai/chat`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ messages }),
  });
  if (!res.ok) return { text: null, fallback: true };
  return res.json() as Promise<{ text: string | null; fallback?: boolean }>;
}
