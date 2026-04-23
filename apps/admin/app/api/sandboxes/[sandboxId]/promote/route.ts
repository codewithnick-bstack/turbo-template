import { NextResponse } from "next/server";
import { getApiClient } from "../../../../../lib/api";

export async function POST(_req: Request, { params }: { params: Promise<{ sandboxId: string }> }) {
  const { sandboxId } = await params;
  const api = getApiClient();
  const result = await api.sandboxes.promote(sandboxId);
  return NextResponse.json(result);
}
