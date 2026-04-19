import { NextRequest, NextResponse } from "next/server";
import { getApiClient } from "../../../../../lib/api";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  const api = getApiClient();
  const data = await api.blog.getPost(postId);
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  const body = await req.json();
  const api = getApiClient();
  const data = await api.blog.updatePost(postId, body);
  return NextResponse.json(data);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  const { action } = (await req.json()) as { action: string };
  const api = getApiClient();
  if (action === "publish") {
    const data = await api.blog.publishPost(postId);
    return NextResponse.json(data);
  }
  return NextResponse.json({ code: "bad_request", message: "Unknown action" }, { status: 400 });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  const api = getApiClient();
  await api.blog.deletePost(postId);
  return NextResponse.json({ ok: true });
}
