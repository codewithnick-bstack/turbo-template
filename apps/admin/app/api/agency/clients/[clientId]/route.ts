import { NextResponse } from "next/server";
import { getApiClient } from "../../../../../lib/api";

export async function GET(_req: Request, { params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  const api = getApiClient();
  const client = await api.agency.getClient(clientId);
  return NextResponse.json(client);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  const body = await req.json();
  const api = getApiClient();
  const client = await api.agency.updateClient(clientId, body);
  return NextResponse.json(client);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  const api = getApiClient();
  const result = await api.agency.removeClient(clientId);
  return NextResponse.json(result);
}
