import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center text-center">
      <p className="text-6xl font-bold text-[var(--muted-foreground)] opacity-20">404</p>
      <p className="mt-4 text-sm font-medium">Page not found</p>
      <Link
        href="/"
        className="mt-6 rounded border border-[var(--border)] px-4 py-2 text-sm hover:bg-[var(--border)] transition-colors"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
