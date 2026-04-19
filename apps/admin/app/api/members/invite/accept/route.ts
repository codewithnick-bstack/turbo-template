import { NextRequest, NextResponse } from "next/server";

const API = process.env.PLATFORM_API_URL ?? "http://localhost:4100";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const res = await fetch(`${API}/v1/members/invite/accept`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
