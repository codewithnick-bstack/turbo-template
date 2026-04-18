import { NextRequest, NextResponse } from "next/server";
import { getApiClient } from "@/lib/api";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const api = getApiClient();
  const data = await api.pages.update(id, body);
  return NextResponse.json(data);
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const api = getApiClient();
  const data = await api.pages.get(id);
  return NextResponse.json(data);
}
