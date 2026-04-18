import { NextRequest, NextResponse } from "next/server";

const API = process.env.PLATFORM_API_URL ?? "http://localhost:4100";
const DEV_TENANT = process.env.DEV_TENANT_ID ?? "dev-tenant-id";

function proxyHeaders() {
  return {
    "content-type": "application/json",
    "x-tenant-id": DEV_TENANT,
    "x-user-id": "dev-user-id",
    "x-role": "owner",
  };
}

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action") ?? "audit";
  const endpoint = action === "generate-meta" ? "seo/generate-meta" : "seo/audit";
  const body = await req.text();
  const res = await fetch(`${API}/v1/ai/${endpoint}`, {
    method: "POST",
    headers: proxyHeaders(),
    body,
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
