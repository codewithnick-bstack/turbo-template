import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

const REVALIDATE_TOKEN = process.env.REVALIDATE_SECRET ?? "dev-revalidate-secret";

export async function POST(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${REVALIDATE_TOKEN}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const path = typeof body.path === "string" ? body.path : "/";

  revalidatePath(path);
  return NextResponse.json({ revalidated: true, path });
}
