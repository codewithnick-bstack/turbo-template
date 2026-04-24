"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

function MagicLinkVerifier() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setErrorMsg("Missing or invalid sign-in link. Request a new one.");
      return;
    }

    fetch(`${apiUrl}/auth/magic-link/verify?token=${encodeURIComponent(token)}`, {
      method: "GET",
      credentials: "include",
    })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({})) as { message?: string };
          throw new Error(body.message ?? "Invalid or expired link");
        }
        setStatus("success");
        setTimeout(() => router.push("/"), 1000);
      })
      .catch((err: unknown) => {
        setStatus("error");
        setErrorMsg(err instanceof Error ? err.message : "Sign-in link is invalid or has expired.");
      });
  }, [searchParams, router]);

  if (status === "verifying") {
    return (
      <div className="text-center">
        <p className="text-[var(--muted-foreground)] text-sm">Verifying your sign-in link…</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="text-center">
        <p className="text-sm font-medium text-green-600">Signed in! Redirecting…</p>
      </div>
    );
  }

  return (
    <div className="text-center">
      <p className="mb-4 text-sm text-red-600" role="alert">{errorMsg}</p>
      <Link href="/forgot-password" className="text-sm text-[var(--primary)] underline">
        Request a new sign-in link
      </Link>
    </div>
  );
}

export default function MagicLinkPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[var(--background)] px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-8 text-2xl font-bold text-[var(--foreground)] text-center">Signing in…</h1>
        <Suspense fallback={<p className="text-sm text-center text-[var(--muted-foreground)]">Loading…</p>}>
          <MagicLinkVerifier />
        </Suspense>
      </div>
    </main>
  );
}
