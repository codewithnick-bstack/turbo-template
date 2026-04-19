import { NextRequest, NextResponse } from "next/server";
import { getApiClient } from "../../../../../lib/api";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ inviteId: string }> },
) {
  const { inviteId } = await params;
  const api = getApiClient();
  await api.members.revokeInvite(inviteId);
  return NextResponse.json({ ok: true });
}
