export const ANALYTICS_EVENTS = {
  HERO_CTA_CLICKED: "hero_cta_clicked",
  CONTACT_FORM_STARTED: "contact_form_started",
  CONTACT_FORM_SUBMITTED: "contact_form_submitted",
  CONTACT_FORM_ABANDONED: "contact_form_abandoned",
  PORTFOLIO_ITEM_CLICKED: "portfolio_item_clicked",
  CHATBOT_OPENED: "chatbot_opened",
  CHAT_MESSAGE_SENT: "chat_message_sent",
  PRICING_CTA_CLICKED: "pricing_cta_clicked",
  SERVICE_VIEWED: "service_viewed",
  SCROLL_DEPTH: "scroll_depth",
  BLOG_POST_READ: "blog_post_read",
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
