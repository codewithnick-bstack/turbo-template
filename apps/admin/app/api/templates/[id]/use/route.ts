import { NextRequest, NextResponse } from "next/server";
import { getApiClient } from "@/lib/api";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json() as { name: string; slug: string };
  const api = getApiClient();
  const data = await api.templates.use(id, body);
  return NextResponse.json(data);
}
