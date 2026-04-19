import { NextRequest, NextResponse } from "next/server";
import { getApiClient } from "@/lib/api";

export async function GET() {
  const api = getApiClient();
  const data = await api.branding.get();
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const api = getApiClient();
  const data = await api.branding.update(body);
  return NextResponse.json(data);
}
