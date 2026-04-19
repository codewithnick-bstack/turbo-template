import { NextRequest, NextResponse } from "next/server";
import { getApiClient } from "@/lib/api";

export async function POST(req: NextRequest) {
  const body = await req.json() as { email: string; role?: string };
  const api = getApiClient();
  const data = await api.members.invite(body.email, body.role);
  return NextResponse.json(data);
}
