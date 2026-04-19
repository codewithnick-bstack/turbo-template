import { NextRequest, NextResponse } from "next/server";
import { getApiClient } from "../../../../lib/api";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ mediaId: string }> },
) {
  const { mediaId } = await params;
  const api = getApiClient();
  await api.media.delete(mediaId);
  return NextResponse.json({ ok: true });
}
