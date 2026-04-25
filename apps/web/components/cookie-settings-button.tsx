"use client";

import { useConsent } from "@/components/consent-provider";

export function CookieSettingsButton() {
  const { resetConsent } = useConsent();
  return (
    <button
      onClick={resetConsent}
      className="hover:text-slate-900 dark:hover:text-white"
    >
      Cookie settings
    </button>
  );
}
