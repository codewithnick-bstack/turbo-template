import { NextRequest, NextResponse } from "next/server";
import { getApiClient } from "../../../../../lib/api";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ subscriptionId: string }> },
) {
  const { subscriptionId } = await params;
  const api = getApiClient();
  await api.webhooks.unsubscribe(subscriptionId);
  return NextResponse.json({ ok: true });
}
