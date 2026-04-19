import { NextRequest, NextResponse } from "next/server";
import { getApiClient } from "../../../../lib/api";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const api = getApiClient();
  const result = await api.media.finalize(body);
  return NextResponse.json(result, { status: 201 });
}
