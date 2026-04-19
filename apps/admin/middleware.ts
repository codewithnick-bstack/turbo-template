import { NextResponse, type NextRequest } from "next/server";

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export function middleware(req: NextRequest) {
  if (process.env.NODE_ENV !== "production") return NextResponse.next();
  if (!MUTATING_METHODS.has(req.method)) return NextResponse.next();

  const origin = req.headers.get("origin");
  const host = req.headers.get("host");

  if (!origin) {
    return NextResponse.json({ code: "forbidden", message: "Origin header required" }, { status: 403 });
  }

  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    return NextResponse.json({ code: "forbidden", message: "CSRF check failed" }, { status: 403 });
  }

  if (originHost !== host) {
    return NextResponse.json({ code: "forbidden", message: "CSRF check failed" }, { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
