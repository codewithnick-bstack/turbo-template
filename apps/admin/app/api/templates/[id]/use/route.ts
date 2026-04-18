import { NextRequest, NextResponse } from "next/server";

const API = process.env.PLATFORM_API_URL ?? "http://localhost:4100";
const DEV_TENANT = process.env.DEV_TENANT_ID ?? "dev-tenant-id";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.text();
  const res = await fetch(`${API}/v1/templates/${id}/use`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-tenant-id": DEV_TENANT,
      "x-user-id": "dev-user-id",
      "x-role": "owner",
    },
    body,
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
