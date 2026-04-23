import { NextResponse } from "next/server";
import { getApiClient } from "../../../../lib/api";

export async function GET(_req: Request, { params }: { params: Promise<{ sandboxId: string }> }) {
  const { sandboxId } = await params;
  const api = getApiClient();
  const sandbox = await api.sandboxes.get(sandboxId);
  return NextResponse.json(sandbox);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ sandboxId: string }> }) {
  const { sandboxId } = await params;
  const api = getApiClient();
  const result = await api.sandboxes.delete(sandboxId);
  return NextResponse.json(result);
}
