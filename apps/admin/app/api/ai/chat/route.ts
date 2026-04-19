import { NextRequest, NextResponse } from "next/server";
import { getApiClient } from "@/lib/api";

export async function POST(req: NextRequest) {
  const body = await req.json() as { siteId: string; messages: Array<{ role: string; content: string }> };
  const api = getApiClient();
  const data = await api.aiAssistant.chat(body.siteId, body.messages);
  return NextResponse.json(data);
}
