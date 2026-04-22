import { NextRequest, NextResponse } from "next/server";
import { getApiClient } from "@/lib/api";

type SearchHit = {
  doc: { id: string; kind: string; title: string; url: string };
  score: number;
  snippet?: string;
};

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  if (!q.trim()) return NextResponse.json({ data: [] });

  try {
    const api = getApiClient();
    const result = await api.search.query(q, 10);
    const data = (result.data as SearchHit[]).map((hit) => ({
      id: hit.doc.id,
      kind: hit.doc.kind,
      title: hit.doc.title,
      url: hit.doc.url,
      snippet: hit.snippet,
    }));
    return NextResponse.json({ data });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Search failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
