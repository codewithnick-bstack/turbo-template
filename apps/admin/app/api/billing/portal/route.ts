import { NextRequest, NextResponse } from "next/server";
import { getApiClient } from "@/lib/api";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const api = getApiClient();
  const data = await api.billing.createPortalSession(body);
  return NextResponse.json(data);
}
