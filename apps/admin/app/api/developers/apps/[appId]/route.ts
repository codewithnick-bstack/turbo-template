import { NextResponse } from "next/server";
import { getApiClient } from "../../../../../lib/api";

export async function GET(_req: Request, { params }: { params: Promise<{ appId: string }> }) {
  const { appId } = await params;
  const api = getApiClient();
  const app = await api.oauthApps.get(appId);
  return NextResponse.json(app);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ appId: string }> }) {
  const { appId } = await params;
  const api = getApiClient();
  const result = await api.oauthApps.delete(appId);
  return NextResponse.json(result);
}
