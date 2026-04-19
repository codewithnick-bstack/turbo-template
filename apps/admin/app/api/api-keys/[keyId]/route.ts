import { NextRequest, NextResponse } from "next/server";
import { getApiClient } from "../../../../lib/api";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ keyId: string }> },
) {
  const { keyId } = await params;
  const api = getApiClient();
  await api.apiKeys.revoke(keyId);
  return NextResponse.json({ ok: true });
}
