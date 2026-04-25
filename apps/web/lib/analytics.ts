export const ANALYTICS_EVENTS = {
  HERO_CTA_CLICKED: "hero_cta_clicked",
  CONTACT_FORM_STARTED: "contact_form_started",
  CONTACT_FORM_SUBMITTED: "contact_form_submitted",
  PORTFOLIO_ITEM_CLICKED: "portfolio_item_clicked",
  CHATBOT_OPENED: "chatbot_opened",
  CHAT_MESSAGE_SENT: "chat_message_sent",
} as const;

export function trackEvent(
  name: string,
  params?: Record<string, string | number | boolean>,
): void {
  if (typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return;
  window.gtag("event", name, params);
}

export function trackClarityEvent(name: string): void {
  if (typeof window === "undefined") return;
  if (typeof window.clarity !== "function") return;
  window.clarity("event", name);
}
