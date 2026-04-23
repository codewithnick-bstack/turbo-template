import { NextRequest, NextResponse } from "next/server";
import { getApiClient } from "../../../lib/api";

export async function GET(req: NextRequest) {
  const siteId = req.nextUrl.searchParams.get("siteId");
  if (!siteId) return NextResponse.json({ error: "siteId required" }, { status: 400 });
  const api = getApiClient();
  const data = await api.sandboxes.list(siteId);
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const api = getApiClient();
  const body = await req.json() as { siteId: string; name: string };
  const sandbox = await api.sandboxes.create(body);
  return NextResponse.json(sandbox, { status: 201 });
}
