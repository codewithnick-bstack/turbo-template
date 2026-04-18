import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple, transparent pricing. Start free.",
};

const PLANS = [
  {
    name: "Starter",
    price: "$0",
    period: "forever",
    description: "Perfect for personal projects and experiments.",
    features: [
      "1 site",
      "5 pages per site",
      "100 form submissions / month",
      "Analytics (30-day window)",
      "Community support",
    ],
    cta: "Get started free",
    ctaHref: "/onboarding",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/ month",
    description: "For growing businesses that need more power.",
    features: [
      "10 sites",
      "Unlimited pages",
      "10,000 form submissions / month",
      "Analytics (90-day window)",
      "AI content generation",
      "Custom domains",
      "Priority support",
    ],
    cta: "Start free trial",
    ctaHref: "/onboarding",
    highlighted: true,
  },
  {
    name: "Agency",
    price: "$99",
    period: "/ month",
    description: "For agencies managing multiple clients.",
    features: [
      "Unlimited sites",
      "White-label branding",
      "Template marketplace",
      "Client seat management",
      "Reseller billing",
      "MCP / agent API access",
      "Dedicated support",
    ],
    cta: "Contact sales",
    ctaHref: "/contact",
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-24">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold tracking-tight mb-4">Simple pricing</h1>
        <p className="text-xl text-neutral-500">Start free. Scale as you grow. No surprises.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`relative rounded-2xl p-8 border ${
              plan.highlighted
                ? "border-indigo-600 shadow-xl shadow-indigo-100"
                : "border-neutral-200"
            }`}
          >
            {plan.highlighted && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                Most popular
              </span>
            )}
            <h2 className="text-lg font-bold mb-1">{plan.name}</h2>
            <div className="flex items-end gap-1 mb-2">
              <span className="text-4xl font-extrabold">{plan.price}</span>
              <span className="text-neutral-500 text-sm mb-1">{plan.period}</span>
            </div>
            <p className="text-sm text-neutral-500 mb-6">{plan.description}</p>
            <a
              href={plan.ctaHref}
              className={`block text-center text-sm font-semibold px-5 py-2.5 rounded-xl mb-8 ${
                plan.highlighted
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                  : "bg-neutral-100 hover:bg-neutral-200 text-neutral-900"
              }`}
            >
              {plan.cta}
            </a>
            <ul className="space-y-2.5">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-neutral-700">
                  <span className="text-green-500">✓</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Frequently asked questions</h2>
        <div className="max-w-2xl mx-auto space-y-6 text-left">
          {FAQ.map((q) => (
            <div key={q.q}>
              <p className="font-semibold text-sm mb-1">{q.q}</p>
              <p className="text-sm text-neutral-500">{q.a}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

const FAQ = [
  {
    q: "Can I switch plans at any time?",
    a: "Yes. Upgrade or downgrade immediately. Prorated charges apply.",
  },
  {
    q: "What happens if I exceed my plan limits?",
    a: "You'll see an upgrade prompt in the admin. Existing features keep working until the next billing cycle.",
  },
  {
    q: "Is there a free trial for Pro?",
    a: "Yes — 14 days free, no credit card required.",
  },
  {
    q: "Can agents (Claude, GPT-4) operate my sites?",
    a: "Yes. Every plan includes the MCP server and full agent parity. Agency plan unlocks the complete API surface.",
  },
];
