import { NextRequest, NextResponse } from "next/server";
import { getApiClient } from "../../../lib/api";

export async function GET() {
  const api = getApiClient();
  const data = await api.apiKeys.list();
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const api = getApiClient();
  const key = await api.apiKeys.create(body as { name: string; scopes?: string[] });
  return NextResponse.json(key, { status: 201 });
}
