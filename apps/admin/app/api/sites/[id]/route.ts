import { NextResponse } from "next/server";
import { getApiClient } from "../../../../lib/api";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const api = getApiClient();
  const site = await api.sites.get(id);
  return NextResponse.json(site);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const api = getApiClient();
  const site = await api.sites.update(id, body);
  return NextResponse.json(site);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const api = getApiClient();
  await api.sites.delete(id);
  return NextResponse.json({ ok: true });
}
