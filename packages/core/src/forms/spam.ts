export type SpamCheckInput = {
  data: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  captchaToken?: string;
};

export type SpamResult =
  | { spam: false }
  | { spam: true; reason: "honeypot" | "rate_limit" | "captcha_failed" | "heuristic" };

const HONEYPOT_FIELDS = ["website", "url", "phone2", "fax"];

export async function checkSpam(input: SpamCheckInput): Promise<SpamResult> {
  // Honeypot fields
  for (const field of HONEYPOT_FIELDS) {
    if (input.data[field] && String(input.data[field]).length > 0) {
      return { spam: true, reason: "honeypot" };
    }
  }

  // Heuristic: suspicious patterns
  const allValues = Object.values(input.data).map(String).join(" ").toLowerCase();
  const SPAM_PATTERNS = [
    /\b(viagra|cialis|casino|lottery|prize|click here|buy now)\b/i,
    /https?:\/\/[^\s]{3,}\s+https?:\/\/[^\s]{3,}/,
  ];
  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(allValues)) {
      return { spam: true, reason: "heuristic" };
    }
  }

  // Optional Cloudflare Turnstile / hCaptcha verification
  if (input.captchaToken) {
    const valid = await verifyCaptcha(input.captchaToken);
    if (!valid) return { spam: true, reason: "captcha_failed" };
  }

  return { spam: false };
}

async function verifyCaptcha(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY ?? process.env.HCAPTCHA_SECRET_KEY;
  if (!secret) return true;

  const isTurnstile = !!process.env.TURNSTILE_SECRET_KEY;
  const url = isTurnstile
    ? "https://challenges.cloudflare.com/turnstile/v0/siteverify"
    : "https://hcaptcha.com/siteverify";

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret, response: token }),
  });

  const json = (await res.json()) as { success: boolean };
  return json.success;
}
