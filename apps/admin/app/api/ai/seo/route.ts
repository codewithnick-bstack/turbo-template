import { NextRequest, NextResponse } from "next/server";
import { getApiClient } from "@/lib/api";

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action") ?? "audit";
  const body = await req.json() as { pageId: string };
  const api = getApiClient();
  const data = action === "generate-meta"
    ? await api.aiAssistant.seoGenerateMeta(body.pageId)
    : await api.aiAssistant.seoAudit(body.pageId);
  return NextResponse.json(data);
}
