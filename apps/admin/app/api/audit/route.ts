import { NextRequest, NextResponse } from "next/server";
import { getApiClient } from "../../../lib/api";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const api = getApiClient();
  const data = await api.audit.list({
    limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined,
    offset: searchParams.get("offset") ? Number(searchParams.get("offset")) : undefined,
    resourceKind: searchParams.get("resourceKind") ?? undefined,
    since: searchParams.get("since") ?? undefined,
  });
  return NextResponse.json(data);
}
