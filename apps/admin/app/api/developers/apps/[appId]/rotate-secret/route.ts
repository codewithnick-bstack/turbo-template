import { NextResponse } from "next/server";
import { getApiClient } from "../../../../../../lib/api";

export async function POST(_req: Request, { params }: { params: Promise<{ appId: string }> }) {
  const { appId } = await params;
  const api = getApiClient();
  const result = await api.oauthApps.rotateSecret(appId);
  return NextResponse.json(result);
}
