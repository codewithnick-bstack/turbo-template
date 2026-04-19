import { NextRequest, NextResponse } from "next/server";
import { getApiClient } from "../../../../lib/api";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ entryId: string }> },
) {
  const { entryId } = await params;
  const api = getApiClient();
  const data = await api.entries.get(entryId);
  return NextResponse.json(data);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ entryId: string }> },
) {
  const { entryId } = await params;
  const body = await req.json();
  const api = getApiClient();
  const data = await api.entries.update(entryId, body);
  return NextResponse.json(data);
}
