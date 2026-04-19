import { NextRequest, NextResponse } from "next/server";
import { getApiClient } from "../../../lib/api";

export async function GET(req: NextRequest) {
  const collectionId = req.nextUrl.searchParams.get("collectionId");
  if (!collectionId) return NextResponse.json({ code: "bad_request", message: "collectionId required" }, { status: 400 });
  const status = req.nextUrl.searchParams.get("status") as "draft" | "published" | undefined ?? undefined;
  const api = getApiClient();
  const data = await api.entries.list(collectionId, status);
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const api = getApiClient();
  const entry = await api.entries.create(body);
  return NextResponse.json(entry, { status: 201 });
}
