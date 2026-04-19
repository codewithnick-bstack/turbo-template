import { NextRequest, NextResponse } from "next/server";
import { getApiClient } from "../../../lib/api";

export async function GET(req: NextRequest) {
  const siteId = req.nextUrl.searchParams.get("siteId");
  if (!siteId) return NextResponse.json({ code: "bad_request", message: "siteId required" }, { status: 400 });
  const api = getApiClient();
  const data = await api.forms.list(siteId);
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const api = getApiClient();
  const form = await api.forms.create(body);
  return NextResponse.json(form, { status: 201 });
}
