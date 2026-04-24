import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/favicon.ico", "/_next"];

function isOriginSafe(origin: string | null, host: string | null): boolean {
  if (!origin || !host) return true;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // CSRF protection for all mutating requests
  if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    const origin = req.headers.get("origin");
    const host = req.headers.get("host");
    if (!isOriginSafe(origin, host)) {
      return NextResponse.json({ code: "forbidden", message: "CSRF check failed" }, { status: 403 });
    }
  }

  // Check for better-auth session cookie
  const sessionCookie =
    req.cookies.get("better-auth.session_token") ??
    req.cookies.get("__Secure-better-auth.session_token");

  if (!sessionCookie) {
    const loginUrl = new URL("/login", req.url);
    // Validate callbackUrl stays on-origin
    const callbackUrl = pathname.startsWith("/") ? pathname : "/";
    loginUrl.searchParams.set("callbackUrl", callbackUrl);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
