export const siteConfig = {
  name: "Northstar Studio",
  description:
    "A polished client-site starter for agencies, freelancers, and small businesses that need beautiful websites shipped fast.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  phone: "+1 (555) 014-2211",
  email: "hello@northstarstudio.dev",
  location: "Remote-first · Serving clients worldwide",
  nav: [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/services", label: "Services" },
    { href: "/portfolio", label: "Portfolio" },
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contact" },
  ],
  socials: [
    { href: "https://x.com", label: "X" },
    { href: "https://instagram.com", label: "Instagram" },
    { href: "https://linkedin.com", label: "LinkedIn" },
  ],
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

export const teamMembers = [
  {
    name: "Maya Ortiz",
    role: "Creative Director",
    bio: "Shapes each site's tone, layout, and visual system so every page feels premium and intentional.",
  },
  {
    name: "Jon Park",
    role: "Full-Stack Developer",
    bio: "Owns Next.js, API integrations, and deployment so launches stay fast and low-maintenance.",
  },
  {
    name: "Aisha Khan",
    role: "SEO Strategist",
    bio: "Connects on-page SEO, structured data, and content planning to support long-term growth.",
  },
];

export const testimonials = [
  {
    quote:
      "We went from a dated brochure site to a fast, confident brand experience in under three weeks.",
    name: "Olivia Reed",
    company: "Reed Wellness Co.",
  },
  {
    quote:
      "The starter gave us a repeatable system for client launches without sacrificing polish.",
    name: "Daniel Price",
    company: "Harbor Creative",
  },
  {
    quote:
      "Our leads increased almost immediately after the contact flow and service pages went live.",
    name: "Nina Brooks",
    company: "North Peak Consulting",
  },
];

export const projects = [
  {
    slug: "atelier-luna",
    title: "Atelier Luna",
    category: "Lifestyle",
    summary: "A warm editorial-style site for a boutique interior design studio.",
    results: ["+42% inquiry rate", "94 mobile speed score"],
  },
  {
    slug: "pulse-legal",
    title: "Pulse Legal",
    category: "Professional Services",
    summary: "A credible, high-trust presence built for consultation bookings.",
    results: ["+27% booked calls", "Expanded local SEO reach"],
  },
  {
    slug: "summit-fit",
    title: "Summit Fit",
    category: "Fitness",
    summary: "Campaign-ready landing pages for a growing online coaching brand.",
    results: ["2.1x conversion lift", "Better ad relevance scores"],
  },
  {
    slug: "craft-and-clay",
    title: "Craft & Clay",
    category: "Ecommerce",
    summary: "A visual-first launch page that pairs storytelling with product drops.",
    results: ["Sold out first collection", "Featured by local press"],
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
