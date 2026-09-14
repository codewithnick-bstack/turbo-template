"use client";

import { useState } from "react";
import Link from "next/link";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/auth/magic-link`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, callbackURL: "/magic-link" }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { message?: string };
        const msg = body.message ?? "";
        if (msg.toLowerCase().includes("email") || msg.toLowerCase().includes("configured") || msg.toLowerCase().includes("resend")) {
          setError("Email delivery is not configured. Ask your administrator to set RESEND_API_KEY.");
          return;
        }
      }
      // Always show "check your email" — never reveal whether address exists
      setSent(true);
    } catch {
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[var(--background)] px-4">
        <div className="w-full max-w-sm text-center">
          <h1 className="mb-2 text-2xl font-bold text-[var(--foreground)]">Check your email</h1>
          <p className="mb-6 text-sm text-[var(--muted-foreground)]">
            If an account exists for <strong>{email}</strong>, a sign-in link was sent.
          </p>
          <Link href="/login" className="text-sm text-[var(--primary)] underline">
            Back to sign in
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[var(--background)] px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-2 text-2xl font-bold text-[var(--foreground)]">Forgot password</h1>
        <p className="mb-8 text-sm text-[var(--muted-foreground)]">
          Enter your admin email and we&apos;ll send you a sign-in link.
        </p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">Email</label>
            <input
              id="email"
              type="email"
              required
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              aria-describedby={error ? "fp-error" : undefined}
              aria-invalid={!!error}
            />
          </div>
          {error ? (
            <p id="fp-error" role="alert" aria-live="assertive" className="text-sm text-red-600">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Sending…" : "Send sign-in link"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--muted-foreground)]">
          Remember your password?{" "}
          <Link href="/login" className="text-[var(--primary)] underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
