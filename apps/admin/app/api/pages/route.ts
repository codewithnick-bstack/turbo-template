import { NextResponse } from "next/server";
import { getApiClient } from "../../../lib/api";

export async function GET(req: Request) {
  const siteId = new URL(req.url).searchParams.get("siteId");
  if (!siteId) return NextResponse.json({ error: "siteId required" }, { status: 400 });
  const api = getApiClient();
  const data = await api.pages.list(siteId);
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const api = getApiClient();
  const page = await api.pages.create(body);
  return NextResponse.json(page, { status: 201 });
}
