"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

type Consent = "granted" | "denied" | null;

const STORAGE_KEY = "cookie-consent";

interface ConsentContextValue {
  consent: Consent;
  grantConsent: () => void;
  denyConsent: () => void;
}

const ConsentContext = createContext<ConsentContextValue>({
  consent: null,
  grantConsent: () => {},
  denyConsent: () => {},
});

export function useConsent() {
  return useContext(ConsentContext);
}

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<Consent>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Consent | null;
      if (stored === "granted" || stored === "denied") setConsent(stored);
    } catch {
      // localStorage unavailable (private browsing) — keep null
    }
  }, []);

  const grantConsent = useCallback(() => {
    try { localStorage.setItem(STORAGE_KEY, "granted"); } catch { /* localStorage unavailable */ }
    setConsent("granted");
  }, []);

  const denyConsent = useCallback(() => {
    try { localStorage.setItem(STORAGE_KEY, "denied"); } catch { /* localStorage unavailable */ }
    setConsent("denied");
  }, []);

  return (
    <ConsentContext.Provider value={{ consent, grantConsent, denyConsent }}>
      {children}
    </ConsentContext.Provider>
  );
}
