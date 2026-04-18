import { NextResponse } from "next/server";
import { getApiClient } from "../../../lib/api";

export async function GET() {
  const api = getApiClient();
  const data = await api.sites.list();
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const api = getApiClient();
  const site = await api.sites.create(body);
  return NextResponse.json(site, { status: 201 });
}
