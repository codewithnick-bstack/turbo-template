import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

const REVALIDATE_TOKEN = process.env.REVALIDATE_SECRET;

const ALLOWED_PATHS = new Set(["/", "/blog", "/portfolio", "/team", "/testimonials", "/about", "/services", "/pricing", "/contact"]);

export async function POST(req: Request) {
  if (!REVALIDATE_TOKEN) {
    return NextResponse.json({ error: "revalidation not configured" }, { status: 503 });
  }

  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${REVALIDATE_TOKEN}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({})) as { path?: unknown };
  const path = typeof body.path === "string" && ALLOWED_PATHS.has(body.path) ? body.path : "/";

  revalidatePath(path);
  return NextResponse.json({ revalidated: true, path });
}
