import { NextRequest, NextResponse } from "next/server";
import { getApiClient } from "@/lib/api";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const api = getApiClient();
  const data = await api.sites.bindDomain(id, body.hostname);
  return NextResponse.json(data);
}
