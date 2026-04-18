import { NextRequest, NextResponse } from "next/server";

const API = process.env.PLATFORM_API_URL ?? "http://localhost:4100";
const DEV_TENANT = process.env.DEV_TENANT_ID ?? "dev-tenant-id";

function mockHeaders() {
  return {
    "content-type": "application/json",
    "x-tenant-id": DEV_TENANT,
    "x-user-id": "dev-user-id",
    "x-role": "owner",
  };
}

export async function GET() {
  const res = await fetch(`${API}/v1/branding`, { headers: mockHeaders() });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function PATCH(req: NextRequest) {
  const body = await req.text();
  const res = await fetch(`${API}/v1/branding`, {
    method: "PATCH",
    headers: mockHeaders(),
    body,
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
