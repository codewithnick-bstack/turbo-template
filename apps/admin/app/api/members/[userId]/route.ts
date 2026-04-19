import { NextRequest, NextResponse } from "next/server";
import { getApiClient } from "../../../../lib/api";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  const { userId } = await params;
  const api = getApiClient();
  await api.members.remove(userId);
  return NextResponse.json({ ok: true });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  const { userId } = await params;
  const { role } = (await req.json()) as { role: string };
  const api = getApiClient();
  await api.members.updateRole(userId, role);
  return NextResponse.json({ ok: true });
}
