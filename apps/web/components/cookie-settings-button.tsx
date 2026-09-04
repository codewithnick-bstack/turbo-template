"use client";

import { useConsent } from "@/components/consent-provider";

export function CookieSettingsButton() {
  const { resetConsent } = useConsent();
  return (
    <button onClick={resetConsent} className="inline-block py-1.5 hover:text-white">
      Cookie settings
    </button>
  );
}
