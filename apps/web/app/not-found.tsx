import Link from "next/link";

import { Button } from "@/components/ui/button";
import { NotFoundTracker } from "@/components/not-found-tracker";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-24 text-center sm:px-6 lg:px-8">
      <NotFoundTracker />
      <p className="rounded-full bg-[var(--muted-bg)] px-4 py-1 text-sm font-semibold text-[var(--navy)] dark:text-white">
        404 — Page not found
      </p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight">This page drifted out of orbit.</h1>
      <p className="mt-3 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-300">
        Head back home or jump to the contact page to start a new client launch.
      </p>
      <div className="mt-6 flex gap-3">
        <Link href="/">
          <Button>Go home</Button>
        </Link>
        <Link href="/contact">
          <Button variant="outline">Contact us</Button>
        </Link>
      </div>
    </div>
  );
}
