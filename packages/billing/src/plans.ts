export type PlanId = "starter" | "pro" | "agency";

export type Plan = {
  id: PlanId;
  name: string;
  description: string;
  includedSites: number;
  includedSeats: number;
  includedFormSubmissions: number;
  includedAiTokens: number;
  canResell: boolean;
  features: string[];
};

export const PLANS: Record<PlanId, Plan> = {
  starter: {
    id: "starter",
    name: "Starter",
    description: "Solo creators and small businesses",
    includedSites: 1,
    includedSeats: 2,
    includedFormSubmissions: 500,
    includedAiTokens: 200_000,
    canResell: false,
    features: ["Custom domain", "Blog", "Contact form", "Analytics basic"],
  },
  pro: {
    id: "pro",
    name: "Pro",
    description: "Agencies and power users",
    includedSites: 10,
    includedSeats: 10,
    includedFormSubmissions: 10_000,
    includedAiTokens: 5_000_000,
    canResell: false,
    features: ["All Starter", "A/B testing", "AI copilot", "SEO autopilot", "Semantic search"],
  },
  agency: {
    id: "agency",
    name: "Agency",
    description: "Reseller tier with client workspaces",
    includedSites: 50,
    includedSeats: 25,
    includedFormSubmissions: 100_000,
    includedAiTokens: 25_000_000,
    canResell: true,
    features: ["All Pro", "White-label", "Client workspaces", "Stripe Connect payouts"],
  },
};
