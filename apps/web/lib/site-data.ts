import brand from "../../../brand.config";

export const siteConfig = {
  name: brand.businessName,
  description:
    "Construction and infrastructure recruiting. 41 years, 35,000 placements, and the people who built America's most iconic projects.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  phone: brand.phone ?? "",
  email: brand.email ?? "",
  location: brand.address ?? "",
  nav: [
    { href: "/why-src", label: "Why SRC" },
    { href: "/employers", label: "For Employers" },
    { href: "/career-seekers", label: "For Career Seekers" },
    { href: "/positions", label: "Positions" },
    { href: "/blog", label: "Blog" },
  ],
  footerExtra: [
    { href: "/contact", label: "Contact" },
    { href: "/team", label: "Our Team" },
    { href: "/testimonials", label: "Testimonials" },
  ],
  socials: brand.socialLinks
    ? Object.entries(brand.socialLinks)
        .filter((entry): entry is [string, string] => typeof entry[1] === "string")
        .map(([label, href]) => ({ label: label.charAt(0).toUpperCase() + label.slice(1), href }))
    : [],
};

/** Hook + rotating subheadlines for the video hero. */
export const hero = {
  hook: "Our People Build America.",
  trademark: true,
  rotating: [
    "Our hands build the American future.",
    "The towers. The bridges. The highways.",
    "41 years of putting the right people on site.",
    "35,000 careers placed. And counting.",
  ],
  question: "What will you build next?",
  primaryCta: { label: "Get Hired", href: "/career-seekers" },
  secondaryCta: { label: "Hire Today", href: "/employers" },
};

export const stats = [
  { label: "Candidate database", value: "275,374" },
  { label: "Successful placements", value: "24,751" },
  { label: "Active positions", value: "180" },
  { label: "Average tenure", value: "4.7 yrs" },
];

export const industries = [
  {
    slug: "commercial-construction",
    title: "Commercial Construction",
    description:
      "Superintendents, project managers, and executives for ground-up commercial builds and interior work.",
  },
  {
    slug: "heavy-construction",
    title: "Heavy Construction",
    description: "Bridges, highways, tunnels, and the civil infrastructure that keeps the country moving.",
  },
  {
    slug: "real-estate-development",
    title: "Real Estate & Commercial Development",
    description: "Development, pre-construction, and owner-side talent for large mixed-use portfolios.",
  },
  {
    slug: "sub-contracting",
    title: "Sub-Contracting",
    description: "Trade leadership across mechanical, electrical, concrete, steel, and specialty scopes.",
  },
];

/** The two audiences. Every page routes back to one of these. */
export const audiencePaths = {
  candidate: 
  {
    audience: "For Career Seekers",
    title: "Take the next step in your career.",
    description:
      "We act as subject matter experts, not resume forwarders. We know the projects, the pay bands, and the managers you would be working for.",
    bullets: [
      "Confidential search — your employer never finds out",
      "Roles that are not posted publicly",
      "Straight answers on comp and project scope",
    ],
    cta: { label: "Get Hired", href: "/career-seekers" },
  },
  employer: {
    audience: "For Employers",
    title: "Fill the role that is holding up the schedule.",
    description:
      "We work as a valued business partner, screening against strict criteria so the shortlist you see is short for a reason.",
    bullets: [
      "275,374-strong construction database",
      "Vetted, verified, and guaranteed placements",
      "Executive search through field leadership",
    ],
    cta: { label: "Hire Today", href: "/employers" },
  },
} as const;

/** Ordered for rendering side by side on the homepage. */
export const paths = [audiencePaths.candidate, audiencePaths.employer];

export const values = [
  {
    title: "Mission",
    description:
      "To be an integral, strategic partner to our candidates and our clients — ensuring our clients' growth and our candidates' career advancement.",
  },
  {
    title: "Purpose",
    description:
      "To make a positive difference in our candidates' lives and our clients' success by streamlining search, recruitment, assessment, and hiring.",
  },
  {
    title: "Integrity",
    description:
      "Confidentiality for candidates and clients, so plans are never jeopardized. Honest subject matter expert assessments, every time.",
  },
  {
    title: "Quality",
    description:
      "Candidates and clients who meet strict criteria. Services that are verified and guaranteed.",
  },
];

/** Kept for template compatibility with /services. */
export const services = industries.map((industry) => ({
  slug: industry.slug,
  title: industry.title,
  summary: industry.description,
  bullets: [] as string[],
  priceFrom: 0,
  accent: "from-slate-500/20 to-slate-700/20",
}));

export const features = industries.map((industry) => ({
  title: industry.title,
  description: industry.description,
}));

export const faqs = [
  {
    question: "Do you charge candidates?",
    answer: "No. Our fees are paid by the hiring company. Working with us costs a candidate nothing.",
  },
  {
    question: "Is my search confidential?",
    answer:
      "Yes. We never present your information to a client without your explicit approval on that specific opportunity.",
  },
  {
    question: "What roles do you place?",
    answer:
      "Field and office leadership through the C-suite: superintendents, project managers, estimators, executives, and owners' representatives.",
  },
  {
    question: "How long have you been doing this?",
    answer:
      "41 years, with approximately 35,000 placements across commercial, heavy civil, development, and sub-contracting.",
  },
];
