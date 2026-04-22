import { NextResponse } from "next/server";
import { getApiClient } from "../../../../lib/api";

export async function GET() {
  const api = getApiClient();
  const data = await api.agency.listClients();
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const api = getApiClient();
  const client = await api.agency.createClient(body);
  return NextResponse.json(client, { status: 201 });
}
