import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const res = await fetch(`${env.PLATFORM_API_URL}/v1/billing/portal`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-tenant-id": env.DEV_TENANT_ID,
      "x-user-id": env.DEV_USER_ID,
      "x-role": "owner",
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
