import { NextRequest, NextResponse } from "next/server";
import { getApiClient } from "@/lib/api";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const api = getApiClient();
    const data = await api.aiAssistant.generateBlogPost(body);
    return NextResponse.json(data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Generation failed";
    return NextResponse.json({ message: msg }, { status: 500 });
  }
}
