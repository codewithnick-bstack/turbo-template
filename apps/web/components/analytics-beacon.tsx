"use client";

import { useEffect } from "react";

export function AnalyticsBeacon({
  siteId,
  tenantId,
  path,
  apiUrl,
}: {
  siteId: string;
  tenantId: string;
  path: string;
  apiUrl: string;
}) {
  useEffect(() => {
    const dnt =
      navigator.doNotTrack === "1" ||
      (window as unknown as { doNotTrack?: string }).doNotTrack === "1";
    if (dnt) return;

    const visitorId = (() => {
      const key = "vid";
      let id = sessionStorage.getItem(key);
      if (!id) {
        id = Math.random().toString(36).slice(2);
        sessionStorage.setItem(key, id);
      }
      return id;
    })();

    const sessionId = (() => {
      const key = "sid";
      let id = sessionStorage.getItem(key);
      if (!id) {
        id = Math.random().toString(36).slice(2);
        sessionStorage.setItem(key, id);
      }
      return id;
    })();

    fetch(`${apiUrl}/v1/analytics/events?tid=${tenantId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        siteId,
        event: "pageview",
        path,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        visitorId,
        sessionId,
      }),
    }).catch(() => undefined);
  }, [path]);

  return null;
}
