---
title: "feat: Add GA4 + Clarity Analytics with Consent Banner and Funnel Tracking"
type: feat
status: active
date: 2026-04-25
---

# feat: Add GA4 + Clarity Analytics with Consent Banner and Funnel Tracking

## Overview

Add production-grade web analytics to `apps/web` using Google Analytics 4 (page views, acquisition, funnel analysis) and Microsoft Clarity (session recordings, heatmaps). Both tools are gated behind a minimal GDPR-compliant cookie consent banner. Custom funnel events instrument the key conversion touchpoints: hero CTAs, contact form, portfolio item clicks, and chatbot interactions.

## Problem Frame

The site has Vercel Analytics for aggregate Web Vitals and page-view counts but no way to answer: Are users clicking the primary CTA? Where do they drop off before submitting the contact form? Which portfolio items get the most interest? GA4 answers funnel questions; Clarity shows the recording of _what_ users actually did. Together they give both quantitative (GA4) and qualitative (Clarity) behaviour data.

**Primary conversion funnel:** `page_view /` → `hero_cta_clicked` → `page_view /contact` → `contact_form_started` → `contact_form_submitted`. This is the sequence to track in GA4 Funnel Exploration after deployment.

## Requirements Trace

- R1. GA4 page-view tracking fires on every route change in the App Router
- R2. Microsoft Clarity session recordings and heatmaps are active
- R3. Both tools only initialise after the user grants consent (GDPR)
- R4. A cookie consent banner is shown on first visit; decision is persisted in `localStorage`
- R5. Custom GA4 events cover: hero CTA clicks, contact form start, contact form submit, portfolio item click, chatbot open, chat message sent
- R6. CSP headers updated to allow GA4 and Clarity script/connect/img domains
- R7. TypeScript types for `window.gtag` and `window.clarity` — no `any`
- R8. Env vars `NEXT_PUBLIC_GA_MEASUREMENT_ID` and `NEXT_PUBLIC_CLARITY_PROJECT_ID` documented in `.env.example`

## Scope Boundaries

- Not using `@next/third-parties/google` `<GoogleAnalytics>` — it has no Consent Mode support and conflicts with consent-gated init (confirmed via Next.js issue #66718)
- Not implementing GA4 Consent Mode v2 (Advanced) — the simpler block-until-consent approach is sufficient for a SaaS template with no Google Ads dependency. Consent Mode v2 is a documented upgrade path.
- Not adding Google Tag Manager — direct gtag.js is sufficient
- Not adding event tracking to every page — only the six high-value funnel events (hero CTA ×2, form start, form submit, portfolio click, chatbot open, chat message sent)
- Vercel Analytics (`@vercel/analytics`) is unchanged — it runs unconditionally and is cookieless
- No server-side analytics or event forwarding to the Express API

### Deferred to Separate Tasks

- GA4 Consent Mode v2 (Advanced): future iteration if Google Ads are added
- Hotjar or FullStory as Clarity alternative: separate evaluation
- Admin dashboard analytics view: separate feature

## Context & Research

### Relevant Code and Patterns

- `apps/web/app/layout.tsx` — Server Component root layout; `<Analytics />` (Vercel) sits after `</ThemeProvider>` as the injection pattern for third-party leaf components
- `apps/web/next.config.ts` lines 12–22 — strict CSP object; `script-src` currently `'self' 'unsafe-inline'`; `connect-src` uses template literal with `apiUrl`
- `apps/web/components/theme-provider.tsx` — pattern for a `"use client"` context provider in `components/`; imported into layout and wraps `<body>` children
- `apps/web/components/chatbot-loader.tsx` + `chatbot-widget.tsx` — two-file pattern for dynamic-import of client widgets
- `apps/web/lib/utils.ts` — pattern for a `lib/` utility module; pure functions, no side effects
- `apps/web/components/contact-form.tsx` line 47 — `onSubmit` async handler; instrumentation point for form events
- `apps/web/components/hero-section.tsx` lines 40–48 — two CTA `<Button>` elements; they spread `...props` so accept `onClick`
- `apps/web/components/portfolio-showcase.tsx` lines 111–114 — `onClick` on "View details" calls `setSelected(entry)`
- `apps/web/components/chatbot-widget.tsx` line 195 — toggle button `onClick`; line 58 — `send` callback

### Institutional Learnings

- None on file in `docs/solutions/` for analytics or third-party scripts

### External References

- Next.js `next/script` docs — `strategy="afterInteractive"` fires after hydration; use for GA4 and Clarity (not `lazyOnload` which fires during idle and misses early interactions)
- `@types/gtag.js` — augments `Window` with full `Gtag` namespace; no manual declaration needed after install
- Microsoft Clarity CSP (Microsoft Learn, Dec 2025) — needs `https://www.clarity.ms` in `script-src`; `https://*.clarity.ms https://c.bing.com` in `connect-src` (wildcard required, Clarity load-balances across lettered subdomains)
- Google Tag Platform CSP guide — `https://*.googletagmanager.com` in `script-src`; `https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com` in `connect-src`

## Key Technical Decisions

- **Raw `next/script` over `@next/third-parties/google`**: `<GoogleAnalytics>` has no consent gating support. Conditional rendering via a `"use client"` component reading consent state is the only clean GDPR approach.
- **Conditional rendering (block-until-consent)**: Simpler and unambiguously GDPR-compliant. GA4/Clarity `<Script>` tags are not rendered until `consent === "granted"`. Consent Mode v2 is a future upgrade path.
- **`ConsentProvider` wraps full `<body>` tree**: Consent state must be readable by both the analytics scripts component and potentially future components (e.g. chatbot gating). Wrapping at the `<body>` level is the correct insertion point — same pattern as `ThemeProvider`.
- **`localStorage` for consent persistence**: Cookies require more complex management (`Set-Cookie` headers or `document.cookie`). `localStorage` is simpler, sufficient, and consistent with how `next-themes` persists the theme preference.
- **`lib/analytics.ts` centralises event definitions**: Inline `window.gtag()` calls scattered across components create implicit coupling. A typed `trackEvent()` utility means event names and param shapes are defined once.
- **`@types/gtag.js` devDependency**: Provides full type safety for `window.gtag` without manual declarations. `window.clarity` requires manual augmentation (no published `@types` package).

## Open Questions

### Resolved During Planning

- _Use `@next/third-parties/google` or raw `next/script`?_ Resolved: raw `next/script` — `@next/third-parties` does not support consent gating (Next.js issue #66718).
- _Consent Mode v2 or block-until-consent?_ Resolved: block-until-consent for template; simpler and unambiguous.
- _Where does `ConsentProvider` sit in the tree?_ Resolved: wraps `ThemeProvider` and everything in `<body>` so all children can read consent state.
- _Are `img-src` CSP changes needed?_ Resolved: No — current CSP already has `img-src 'self' data: blob: https:` which covers all HTTPS image sources including GA4 and Clarity pixels.

### Deferred to Implementation

- _Exact `localStorage` key name and consent values_: Implementer chooses — suggest `"cookie-consent"` with values `"granted"` | `"denied"`.
- _Banner copy and styling_: Banner should match the existing Tailwind/shadcn design system; exact copy TBD by implementer. Keep it minimal (Accept / Decline buttons, one-line explanation).
- _Whether to fire a `consent_granted` GA4 event_: Useful for analytics on consent rate; deferred to implementer discretion.

## High-Level Technical Design

> _This illustrates the intended approach and is directional guidance for review, not implementation specification. The implementing agent should treat it as context, not code to reproduce._

```
app/layout.tsx (Server Component)
  <html>
    <head>
      <style> brand CSS tokens
    </head>
    <body>
      <script> ld+json
      <ConsentProvider>              ← "use client" context; reads localStorage on mount
        <ThemeProvider>
          skip-to-main anchor
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
          <ChatbotLoader />
        </ThemeProvider>
        <Analytics />                ← @vercel/analytics — unchanged, cookieless
        <AnalyticsScripts />         ← "use client"; reads consent; null if not granted
        <CookieConsentBanner />      ← "use client"; null if consent already set
      </ConsentProvider>
    </body>
  </html>
```

Consent state machine:

```
localStorage["cookie-consent"] absent  →  banner visible, scripts blocked
                             "granted"  →  banner hidden, scripts load
                             "denied"   →  banner hidden, scripts blocked
```

Event flow once GA4 loads:

```
user action in component
  → trackEvent(name, params)   (lib/analytics.ts)
    → window.gtag("event", ...)  (no-ops if gtag not initialised)
      → GA4 realtime / event stream
```

## Implementation Units

- [ ] **Unit 1: Update CSP for GA4 and Clarity domains**

**Goal:** Allow GA4 and Clarity scripts and network requests through the existing strict CSP.

**Requirements:** R6

**Dependencies:** None

**Files:**

- Modify: `apps/web/next.config.ts`

**Approach:**

- In `script-src`: append `https://*.googletagmanager.com https://www.clarity.ms`
- In `connect-src`: append `https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://*.clarity.ms https://c.bing.com`
- The `img-src` directive already covers `https:` broadly — no change needed
- Keep existing `'self' 'unsafe-inline'` in `script-src` unchanged; only append
- The `connect-src` line is a template literal — append to the same string
- **Important:** `next.config.ts` changes require a full server restart (dev) or rebuild (prod) to take effect. Hot-reload does not pick up config changes. Test CSP only after restarting the dev server.

**Test scenarios:**

- Happy path: restart dev server after CSP changes, grant consent, verify no CSP-blocked requests for `googletagmanager.com`, `google-analytics.com`, or `clarity.ms` in DevTools Console
- Edge case: deny consent — verify zero requests to GA4 or Clarity domains (scripts never loaded)
- Edge case: test before restart — verify CSP violations appear as red console errors (confirms the header is active and the restart requirement is real)

**Verification:** No CSP console errors in browser after granting consent with GA/Clarity IDs set and server restarted.

---

- [ ] **Unit 2: Consent provider and cookie banner**

**Goal:** Implement a `ConsentProvider` context that persists consent choice in `localStorage`, and a `CookieConsentBanner` UI that shows on first visit until a choice is made.

**Requirements:** R3, R4

**Dependencies:** Unit 1 (CSP must allow scripts; banner can be built independently but tested together)

**Files:**

- Create: `apps/web/components/consent-provider.tsx`
- Create: `apps/web/components/cookie-consent-banner.tsx`
- Modify: `apps/web/app/layout.tsx`

**Approach:**

- `consent-provider.tsx`: `"use client"` context component. Exports `ConsentContext` with `{ consent: "granted" | "denied" | null, grantConsent: () => void, denyConsent: () => void }`. Reads from `localStorage` on mount (in `useEffect` to avoid SSR mismatch). Writes on grant/deny. Export a `useConsent()` hook.
- `cookie-consent-banner.tsx`: `"use client"` component. Calls `useConsent()`. If `consent !== null`, returns `null`. Otherwise renders a fixed-position banner (bottom of screen) with Accept and Decline buttons. Styling follows the existing Tailwind design system (white/dark background, rounded, shadow — consistent with other UI elements). No external dependency.
- `layout.tsx`: Wrap the `<body>` content with `<ConsentProvider>`. Add `<CookieConsentBanner />` inside the provider, after `<Analytics />`.

**Patterns to follow:**

- `apps/web/components/theme-provider.tsx` — `"use client"` context provider pattern
- `apps/web/components/chatbot-loader.tsx` — dynamic-import pattern (not needed here but reference for similar leaf widget placement)

**Test scenarios:**

- Happy path: first visit — banner visible; click Accept — banner disappears, `localStorage["cookie-consent"]` is `"granted"`
- Happy path: first visit — click Decline — banner disappears, `localStorage["cookie-consent"]` is `"denied"`
- Edge case: reload after Accept — banner does not reappear, consent state is `"granted"`
- Edge case: reload after Decline — banner does not reappear, consent state is `"denied"`
- Edge case: SSR — component renders without `localStorage` access errors (must guard reads in `useEffect`)
- Edge case: `localStorage` unavailable (private browsing on some browsers) — banner should not crash; default to `null`

**Verification:** Banner appears on fresh visit (cleared localStorage). Accepting/declining persists across reload. No hydration mismatch errors in console.

---

- [ ] **Unit 3: Consent-gated analytics script loader and env vars**

**Goal:** Load GA4 and Clarity scripts only after consent is granted. Document required env vars.

**Requirements:** R1, R2, R3, R7, R8

**Dependencies:** Unit 2 (consent context must exist), `@types/gtag.js` devDep

**Files:**

- Create: `apps/web/components/analytics-scripts.tsx`
- Create: `apps/web/types/analytics.d.ts`
- Modify: `apps/web/app/layout.tsx`
- Modify: `apps/web/.env.example`

**Approach:**

- Install `@types/gtag.js` as a devDependency in `apps/web` (`pnpm --filter web add -D @types/gtag.js`). This is a stable DefinitelyTyped package (published as `@types/gtag.js` on npm); no version pinning needed beyond latest.
- `analytics.d.ts`: Add a triple-slash `/// <reference types="gtag.js" />` directive (so `window.gtag` is typed). Manually augment `Window` to declare `clarity(method: ClarityMethod, ...args: string[]): void` using a `ClarityMethod` string-literal union (`"consent" | "identify" | "set" | "event" | "upgrade"`). Place in `apps/web/types/` directory (create if absent).
- `analytics-scripts.tsx`: `"use client"` component. Calls `useConsent()`. If `consent !== "granted"`, returns `null`. Otherwise renders two GA4 `<Script>` tags (external src + inline init with `id="ga4-init"`) and one Clarity inline `<Script id="ms-clarity">`, all with `strategy="afterInteractive"`. Reads IDs from `process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID` and `process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID`. If either var is empty/undefined, skip that script (allow partial deployment — Clarity optional).
- `layout.tsx`: Import and render `<AnalyticsScripts />` after `<Analytics />` inside `<ConsentProvider>`. Note: `<Script strategy="afterInteractive">` elements are always moved to the bottom of `<body>` by Next.js at render time, regardless of where they appear in the React component tree — position in the JSX only affects when the component mounts, not where the `<script>` tag lands in the DOM.
- `.env.example`: Add `NEXT_PUBLIC_GA_MEASUREMENT_ID=` and `NEXT_PUBLIC_CLARITY_PROJECT_ID=` with inline comments explaining where to get each ID.

**Patterns to follow:**

- `apps/web/lib/utils.ts` — `process.env.NEXT_PUBLIC_*` access pattern (raw, `?? ""` fallback)
- `apps/web/components/theme-provider.tsx` — `"use client"` wrapper in `components/`

**Test scenarios:**

- Happy path: env vars set + consent granted — network requests to `googletagmanager.com` and `clarity.ms` visible in DevTools Network tab
- Happy path: consent denied — zero requests to either domain
- Edge case: `NEXT_PUBLIC_GA_MEASUREMENT_ID` absent — no GA4 script rendered; no console error
- Edge case: `NEXT_PUBLIC_CLARITY_PROJECT_ID` absent — no Clarity script rendered; no console error
- Edge case: consent granted, then page navigated (App Router client-side) — GA4 Enhanced Measurement auto-tracks the route change (verify in GA4 realtime view)
- Integration: `window.gtag` is defined after grant + script load; `trackEvent()` (Unit 4) calls succeed without errors

**Verification:** With real IDs and consent granted, GA4 Realtime view shows a live session. Clarity shows a recording in the dashboard within ~30 seconds.

---

- [ ] **Unit 4: Analytics event utility**

**Goal:** Provide a typed `trackEvent()` helper that centralises GA4 custom event calls and silently no-ops when GA4 is not loaded.

**Requirements:** R5, R7

**Dependencies:** Unit 3 (type declarations must exist; `window.gtag` type comes from `@types/gtag.js`)

**Files:**

- Create: `apps/web/lib/analytics.ts`

**Approach:**

- Export `trackEvent(name: string, params?: Record<string, string | number | boolean>): void`.
- Guard against SSR (`typeof window === "undefined"`) and unloaded GA4 (`typeof window.gtag !== "function"`). Return early in both cases — no throw, no console warning.
- Optionally export a `trackClarityEvent(name: string): void` that calls `window.clarity("event", name)` with the same guards.
- Define and export a const object of event name strings (e.g. `ANALYTICS_EVENTS`) to prevent typos at call sites.

**Patterns to follow:**

- `apps/web/lib/utils.ts` — pure utility, named exports, no side effects on import

**Test scenarios:**

- Happy path: `window.gtag` defined → `trackEvent("hero_cta_clicked", { button: "primary" })` calls `window.gtag("event", ...)` with correct args
- Edge case: `window.gtag` undefined (consent not granted) → `trackEvent` returns silently, no error
- Edge case: SSR context (`typeof window === "undefined"`) → no crash
- Edge case: `params` undefined → `window.gtag("event", name)` called without params object (valid GA4 call)

**Verification:** TypeScript compiles cleanly (`pnpm --filter web typecheck`). Manual test: with DevTools open, grant consent, trigger a hero CTA click, verify the GA4 `event` call appears in the `__gtag_request` network request payload.

---

- [ ] **Unit 5: Instrument funnel touchpoints**

**Goal:** Fire custom GA4 events at the six key funnel touchpoints using `trackEvent()`.

**Requirements:** R5

**Dependencies:** Unit 4 (`trackEvent` must exist)

**Files:**

- Modify: `apps/web/components/hero-section.tsx`
- Modify: `apps/web/components/contact-form.tsx`
- Modify: `apps/web/components/portfolio-showcase.tsx`
- Modify: `apps/web/components/chatbot-widget.tsx`

**Approach:**

_Hero CTAs_ (`hero-section.tsx`):

- Add `onClick` to the `<Link>` wrapper element (not the inner `<Button>`) for both CTAs. Next.js `<Link>` accepts an `onClick` prop. The event fires before navigation because `gtag` queues synchronously into `dataLayer` and GA4 uses `navigator.sendBeacon()` which survives page unloads — but placing `onClick` on the `<Link>` is the correct element and avoids any ambiguity about event bubbling order.
- Primary `<Link href="/contact">` fires `trackEvent(ANALYTICS_EVENTS.HERO_CTA_CLICKED, { button: "primary", href: "/contact" })`.
- Secondary `<Link href="/portfolio">` fires with `{ button: "secondary", href: "/portfolio" }`.

_Contact form_ (`contact-form.tsx`):

- Add `onFocus` to the `<form>` element itself (not individual `<Input>` fields). Focus bubbles up from any child input, so this fires on first interaction with any field. This avoids conflicting with react-hook-form's `register()` spread, which attaches `onBlur`/`onChange` to individual inputs. Use a `useRef<boolean>` flag (`startedRef`) so the event fires at most once per mount.
- Inside the existing `onSubmit` handler, after the successful API call (just before or after `setIsSuccess(true)`): fire `trackEvent(ANALYTICS_EVENTS.CONTACT_FORM_SUBMITTED, { form_name: "contact" })`.
- Do **not** pass any user-entered values (name, email, message) as event params — PII must stay out of analytics.

_Portfolio item click_ (`portfolio-showcase.tsx`):

- Inside the "View details" button `onClick`, alongside `setSelected(entry)`: fire `trackEvent(ANALYTICS_EVENTS.PORTFOLIO_ITEM_CLICKED, { item_id: entry.id, item_title: entry.title })`.

_Chatbot_ (`chatbot-widget.tsx`):

- On the toggle button `onClick` (line 195), after `setOpen((v) => !v)`: fire `trackEvent(ANALYTICS_EVENTS.CHATBOT_OPENED)` when opening (guard with `if (!open)`).
- In the `send` callback (line 58), after dispatching the message: fire `trackEvent(ANALYTICS_EVENTS.CHAT_MESSAGE_SENT)`. Do **not** pass message content as a param.

**Patterns to follow:**

- `apps/web/components/contact-form.tsx` — existing `useRef` usage pattern
- Keep instrumentation minimal: one line per event, no structural changes to components

**Test scenarios:**

- Happy path (hero): click "Launch your next site" → GA4 DevTools shows `hero_cta_clicked` event with `button: "primary"`
- Happy path (hero): click "Browse examples" → event with `button: "secondary"`
- Happy path (contact form): focus any field → `contact_form_started` fires once; submit form → `contact_form_submitted` fires
- Edge case (contact form): focus multiple fields → `contact_form_started` fires only once (ref guard)
- Edge case (contact form): verify no PII in event params — `name`, `email`, `message` absent from network request
- Happy path (portfolio): click any "View details" → `portfolio_item_clicked` fires with correct `item_id` and `item_title`
- Happy path (chatbot): open chatbot → `chatbot_opened` fires; send a message → `chat_message_sent` fires
- Edge case: all events no-op silently when consent is denied (GA4 not loaded)

**Verification:** GA4 Realtime → Events view shows all five event names. Clarity session recording shows the interactions.

## System-Wide Impact

- **Interaction graph:** `ConsentProvider` is a new React context that wraps the full body tree — any component can call `useConsent()`. `analytics-scripts.tsx` re-renders when consent changes (context value changes trigger re-render, scripts mount on first grant).
- **Error propagation:** `trackEvent()` silently no-ops on all failure paths — undefined `window.gtag`, SSR, or uncaught errors must not bubble to the UI.
- **State lifecycle risks:** `localStorage` read must be guarded in `useEffect` (not during SSR render) to avoid hydration mismatch. The consent state initialises as `null` on the server, then hydrates to the stored value on the client.
- **API surface parity:** No agent-callable analytics API is being added — this is frontend-only instrumentation.
- **Integration coverage:** The critical path to verify is: consent grant → `AnalyticsScripts` mounts → `window.gtag` becomes available → `trackEvent()` calls succeed. This is a runtime sequence that requires browser testing.
- **Unchanged invariants:** `@vercel/analytics` (`<Analytics />`) is completely unchanged. All existing page-view data continues unaffected. The CSP additions are purely additive.

## Risks & Dependencies

| Risk                                                              | Mitigation                                                                                                                           |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| CSP blocks GA4/Clarity silently                                   | Test in browser DevTools Console after deployment; CSP violations show as red console errors                                         |
| Hydration mismatch from `localStorage` read on SSR                | Guard all `localStorage` access inside `useEffect`; initialise consent state as `null`                                               |
| `window.gtag` undefined when `trackEvent()` called before consent | `trackEvent()` guards `typeof window.gtag !== "function"` — no-op silently                                                           |
| Clarity's wildcard subdomain not whitelisted                      | Use `https://*.clarity.ms` wildcard in `connect-src`, not a specific subdomain                                                       |
| Contact form PII leaking to analytics                             | Explicitly documented: do not pass `values.*` fields to `trackEvent()`                                                               |
| GA4 Enhanced Measurement misses App Router route changes          | GA4 Enhanced Measurement "Page changes based on browser history events" handles this automatically; no `usePathname` listener needed |

## Documentation / Operational Notes

- After deploying, create a GA4 Funnel Exploration: `page_view /` → `cta_click` → `page_view /contact` → `contact_form_submitted`.
- Clarity recordings appear with a ~30-second delay in the dashboard.
- To add Consent Mode v2 later: remove the `if (consent !== "granted") return null` guard from `analytics-scripts.tsx`, add `gtag('consent', 'default', { all: 'denied' })` before the GA4 init script, and call `gtag('consent', 'update', { ... })` from `grantConsent()` / `denyConsent()`.
- Add to `docs/solutions/`: note that `next/script` inline scripts require a unique `id` prop for deduplication, and that GA4 + Clarity both require `strategy="afterInteractive"` (not `"lazyOnload"`) to avoid missing early interactions.

## Sources & References

- Related code: `apps/web/app/layout.tsx`, `apps/web/next.config.ts`, `apps/web/components/theme-provider.tsx`
- External docs: [Google Tag Platform CSP guide](https://developers.google.com/tag-platform/security/guides/csp)
- External docs: [Microsoft Clarity CSP (Microsoft Learn)](https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-csp)
- External docs: [Next.js third-party libraries guide](https://nextjs.org/docs/app/guides/third-party-libraries)
- External: Next.js issue #66718 — `@next/third-parties/google` has no Consent Mode support
