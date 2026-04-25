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
  BLOG_POST_CLICKED: "blog_post_clicked",
  OUTBOUND_LINK_CLICKED: "outbound_link_clicked",
  PAGE_NOT_FOUND: "page_not_found",
  JS_ERROR: "js_error",
  NAV_LINK_CLICKED: "nav_link_clicked",
  TESTIMONIAL_VIEWED: "testimonial_viewed",
  CONTACT_DETAIL_CLICKED: "contact_detail_clicked",
  LEAD_CAPTURED: "lead_captured",
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
