"use client";

import { useConsent } from "@/components/consent-provider";

export function CookieConsentBanner() {
  const { consent, grantConsent, denyConsent } = useConsent();

  if (consent !== null) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      // Sits bottom-left so it never shares a corner with the chat bubble
      // (bottom-right). On phones it spans the width and clears the bubble.
      className="fixed bottom-[5.5rem] left-4 right-4 z-[9998] max-w-xl border border-slate-200 bg-white p-4 shadow-2xl shadow-black/10 dark:border-slate-700 dark:bg-slate-900 sm:bottom-6 sm:left-6 sm:right-auto sm:max-w-sm"
    >
      <p className="text-sm text-slate-700 dark:text-slate-300">
        We use cookies for analytics (GA4 + Clarity) to understand how you use this site. No ads, no tracking across other sites.
      </p>
      <div className="mt-3 flex gap-2">
        <button
          onClick={grantConsent}
          className="min-w-0 flex-1 bg-[var(--navy)] px-3 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          Accept
        </button>
        <button
          onClick={denyConsent}
          className="min-w-0 flex-1 border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Decline
        </button>
      </div>
    </div>
  );
}
