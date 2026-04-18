import { NextResponse } from "next/server";
import { getApiClient } from "../../../../lib/api";

export async function GET() {
  const api = getApiClient();
  return NextResponse.json(await api.webhooks.listSubscriptions());
}

export async function POST(req: Request) {
  const body = await req.json();
  const api = getApiClient();
  const sub = await api.webhooks.subscribe(body);
  return NextResponse.json(sub, { status: 201 });
}
