import brand from "../../../brand.config";

export const siteConfig = {
  name: brand.businessName,
  description: brand.tagline ?? "Professional services for modern businesses.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  phone: brand.phone ?? "",
  email: brand.email ?? "",
  location: brand.address ?? "",
  nav: [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/services", label: "Services" },
    { href: "/pricing", label: "Pricing" },
    { href: "/portfolio", label: "Portfolio" },
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contact" },
  ],
  footerExtra: [
    { href: "/team", label: "Team" },
    { href: "/testimonials", label: "Testimonials" },
    { href: "/status", label: "System Status" },
  ],
  socials: brand.socialLinks
    ? Object.entries(brand.socialLinks)
        .filter((entry): entry is [string, string] => typeof entry[1] === "string")
        .map(([label, href]) => ({ label: label.charAt(0).toUpperCase() + label.slice(1), href }))
    : [],
};

export const stats = [
  { label: "Client launches", value: "48+" },
  { label: "Avg. speed score", value: "95" },
  { label: "Lead lift", value: "+31%" },
  { label: "Weeks to launch", value: "2-4" },
];

export const features = [
  {
    title: "Conversion-focused layout",
    description: "Homepages built around trust, clarity, and strong CTAs so visitors convert into leads.",
  },
  {
    title: "SEO-ready foundation",
    description: "Metadata, structured data, sitemap generation, and fast server rendering from day one.",
  },
  {
    title: "Fast client swaps",
    description: "Replace copy, colors, and imagery through a single data file without touching layout code.",
  },
  {
    title: "Modern motion",
    description: "Tasteful animations and polished gradients powered by Framer Motion and Tailwind CSS v4.",
  },
];

export const services = [
  {
    slug: "brand-sites",
    title: "Brand websites",
    summary: "Launch a polished marketing site that tells your story and converts traffic into inquiries.",
    bullets: ["Custom landing pages", "CMS-ready content blocks", "SEO and analytics setup"],
    priceFrom: 2800,
    accent: "from-violet-500/20 to-fuchsia-500/20",
  },
  {
    slug: "lead-generation",
    title: "Lead generation funnels",
    summary: "Pair persuasive design with forms, scheduling, and campaign-ready landing pages.",
    bullets: ["Paid traffic pages", "CRM-ready forms", "A/B testing hooks"],
    priceFrom: 4200,
    accent: "from-cyan-500/20 to-sky-500/20",
  },
  {
    slug: "ongoing-growth",
    title: "Ongoing growth support",
    summary: "Retainers for new pages, CRO updates, and monthly SEO or blog publishing.",
    bullets: ["Monthly content drops", "Performance tuning", "Reporting dashboards"],
    priceFrom: 900,
    accent: "from-emerald-500/20 to-teal-500/20",
  },
];

export const values = [
  {
    title: "Clarity over clutter",
    description: "We simplify the message, sharpen the offer, and remove anything that slows the user down.",
  },
  {
    title: "Built for handoff",
    description: "The starter is organized for agencies and freelancers who need quick swaps for new clients.",
  },
  {
    title: "Accessible by default",
    description: "Semantic structure, contrast-friendly palettes, keyboard support, and reduced-motion respect.",
  },
];

export const faqs = [
  {
    question: "How quickly can I swap this for a new client?",
    answer: "Usually in a day: update the content arrays, color tokens, metadata, and blog posts, then deploy.",
  },
  {
    question: "Can I connect a CMS later?",
    answer: "Yes. The page sections are modular so it's easy to swap the demo dataset for a CMS or database.",
  },
  {
    question: "Is the backend optional?",
    answer: "Yes. The site works standalone, but the Express API adds a production-friendly contact endpoint.",
  },
];
