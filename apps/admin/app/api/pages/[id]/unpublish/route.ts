import { NextResponse } from "next/server";
import { getApiClient } from "../../../../../lib/api";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const api = getApiClient();
  const page = await api.pages.unpublish(id);
  return NextResponse.json(page);
}
