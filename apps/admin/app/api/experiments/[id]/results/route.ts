import { type NextRequest, NextResponse } from "next/server";
import { getApiClient } from "../../../../../lib/api";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const api = getApiClient();
  const data = await api.experiments.results(id);
  return NextResponse.json(data);
}
