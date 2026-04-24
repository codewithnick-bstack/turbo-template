import { createDb } from "./client";
import { blogPosts, teamMembers, testimonials, portfolioEntries, siteSettings } from "./schema";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }

  const { db, close } = createDb({ url });

  try {
    // Settings (single row)
    await db.insert(siteSettings).values({
      businessName: "Acme Studio",
      tagline: "We build digital experiences that grow businesses.",
      email: "hello@acmestudio.com",
      phone: "+1 (555) 123-4567",
      address: "123 Design Street, San Francisco, CA 94102",
      primaryColor: "#6366f1",
      accentColor: "#8b5cf6",
      fontHeading: "Inter",
      fontBody: "Inter",
      socialLinks: {
        twitter: "https://twitter.com/acmestudio",
        linkedin: "https://linkedin.com/company/acmestudio",
        github: "https://github.com/acmestudio",
      },
      seoTitle: "Acme Studio — Digital Design & Development",
      seoDescription:
        "Acme Studio crafts digital experiences that grow businesses. Web design, development, and strategy for startups and enterprises.",
    }).onConflictDoNothing();

    // Blog posts
    await db.insert(blogPosts).values([
      {
        slug: "getting-started-with-nextjs-15",
        title: "Getting Started with Next.js 15",
        excerpt: "Explore the new features in Next.js 15 and how to migrate your existing projects.",
        content: `# Getting Started with Next.js 15

Next.js 15 brings significant improvements to the App Router, including faster builds, improved streaming, and better developer experience.

## What's New

- **Turbopack** is now stable and enabled by default
- **React 19** support with improved Server Components
- **Partial Prerendering** for fine-grained static/dynamic control
- **Enhanced \`after()\` API** for post-response work

## Getting Started

Create a new project with:

\`\`\`bash
npx create-next-app@latest my-app
\`\`\`

The setup wizard walks you through TypeScript, Tailwind, and App Router configuration.

## Migrating from Next.js 14

Most migrations are straightforward. The main change is the updated caching defaults — fetch requests are no longer cached by default, which aligns more closely with web standards.

Check the [official migration guide](https://nextjs.org/docs/app/building-your-application/upgrading/version-15) for a complete list of changes.`,
        author: "Sarah Chen",
        coverImageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200",
        status: "published" as const,
        publishedAt: new Date("2024-12-01"),
        metaTitle: "Getting Started with Next.js 15 — Acme Studio Blog",
        metaDescription: "Explore the new features in Next.js 15 and how to migrate your existing projects.",
      },
      {
        slug: "designing-for-ai-first-products",
        title: "Designing for AI-First Products",
        excerpt: "How to approach UX design when AI is a core feature, not an afterthought.",
        content: `# Designing for AI-First Products

When AI is central to your product, design principles shift significantly. Users interact differently with systems that can reason, generate, and adapt.

## Core Principles

### 1. Transparency Over Magic
Users need to understand what the AI is doing and why. Show confidence levels, surface reasoning, and always make it clear when content is AI-generated.

### 2. Graceful Degradation
AI features must degrade gracefully. If the AI is unavailable, the product should remain useful — not broken.

### 3. Iterative Refinement
Design feedback loops that let users guide and correct the AI. A single-shot generation is rarely perfect; the real value is in the iteration.

## Practical Patterns

- **Progressive disclosure**: Show basic output first, offer "explain this" as secondary action
- **Confidence indicators**: Use visual cues when AI is uncertain
- **Undo/redo for AI actions**: Users need to feel safe experimenting
- **Clear attribution**: Always indicate AI-generated content

AI-first design is still evolving. The teams winning are those treating AI as a collaborator in the design process, not just a feature to ship.`,
        author: "Marcus Rivera",
        coverImageUrl: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1200",
        status: "published" as const,
        publishedAt: new Date("2024-11-15"),
        metaTitle: "Designing for AI-First Products — Acme Studio Blog",
        metaDescription: "How to approach UX design when AI is a core feature, not an afterthought.",
      },
      {
        slug: "building-accessible-design-systems",
        title: "Building Accessible Design Systems",
        excerpt: "Accessibility should be baked into your design system from day one, not bolted on later.",
        content: `# Building Accessible Design Systems

A design system is only as good as its worst accessible component. Building accessibility in from the start is dramatically cheaper than retrofitting it later.

## The Foundation: Color Tokens

Never hardcode colors. Use semantic tokens that can be adjusted for high-contrast modes:

\`\`\`css
:root {
  --color-text-primary: #111827;
  --color-text-secondary: #6b7280;
  --color-surface: #ffffff;
}
\`\`\`

## Component Checklist

Every component should pass:

- **WCAG 2.2 AA** color contrast ratios
- **Keyboard navigation** — all interactive elements reachable and operable
- **Screen reader** — proper ARIA labels and roles
- **Focus management** — visible focus indicators, logical tab order
- **Motion** — respect \`prefers-reduced-motion\`

## Testing Strategy

- Automated: axe-core in CI on every PR
- Manual: quarterly screen reader walkthrough
- User testing: include users with disabilities in research sessions

Accessibility is not a checkbox — it's an ongoing practice that improves the experience for everyone.`,
        author: "Priya Patel",
        coverImageUrl: "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=1200",
        status: "published" as const,
        publishedAt: new Date("2024-10-28"),
        metaTitle: "Building Accessible Design Systems — Acme Studio Blog",
        metaDescription: "Accessibility should be baked into your design system from day one, not bolted on later.",
      },
    ]);

    // Team members
    await db.insert(teamMembers).values([
      {
        name: "Sarah Chen",
        title: "Founder & Creative Director",
        bio: "Sarah founded Acme Studio after 10 years leading design teams at tech companies. She believes great design is invisible — it just works.",
        photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
        order: 1,
        linkedinUrl: "https://linkedin.com/in/sarahchen",
        twitterUrl: "https://twitter.com/sarahchen",
      },
      {
        name: "Marcus Rivera",
        title: "Head of Engineering",
        bio: "Marcus brings 8 years of full-stack experience, with deep expertise in React, TypeScript, and distributed systems. He obsesses over performance.",
        photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
        order: 2,
        linkedinUrl: "https://linkedin.com/in/marcusrivera",
      },
      {
        name: "Priya Patel",
        title: "Senior Designer",
        bio: "Priya specializes in design systems and accessibility. She's led design at two YC-backed startups and mentors junior designers across the industry.",
        photoUrl: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400",
        order: 3,
        linkedinUrl: "https://linkedin.com/in/priyapatel",
        twitterUrl: "https://twitter.com/priyapatel",
      },
      {
        name: "James Wilson",
        title: "Strategy & Growth",
        bio: "James helps clients connect design investments to business outcomes. He's worked with 50+ companies across SaaS, e-commerce, and fintech.",
        photoUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
        order: 4,
        linkedinUrl: "https://linkedin.com/in/jameswilson",
      },
    ]);

    // Testimonials
    await db.insert(testimonials).values([
      {
        authorName: "Alex Thompson",
        company: "Founder at Horizon SaaS",
        role: "CEO",
        quote: "Acme Studio didn't just redesign our product — they transformed how our users experience it. Conversion improved 40% in the first month.",
        rating: 5,
        photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
        featured: true,
      },
      {
        authorName: "Emily Rodriguez",
        company: "Head of Product at Bloom Finance",
        role: "Head of Product",
        quote: "Working with Acme felt like having a world-class design team in-house. They delivered in half the time we expected, with zero compromises on quality.",
        rating: 5,
        photoUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200",
        featured: true,
      },
      {
        authorName: "David Park",
        company: "CTO at Buildly",
        role: "CTO",
        quote: "Their design system saved us 6 months of engineering time. Every component was accessible, documented, and battle-tested. Highly recommend.",
        rating: 5,
        photoUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200",
        featured: false,
      },
      {
        authorName: "Lisa Monroe",
        company: "Founder at Petal Health",
        role: "Founder",
        quote: "Acme Studio understood our complex domain immediately and translated it into an interface that even our least tech-savvy users love.",
        rating: 5,
        photoUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200",
        featured: true,
      },
    ]);

    // Portfolio entries
    await db.insert(portfolioEntries).values([
      {
        title: "Horizon SaaS — Product Redesign",
        client: "Horizon",
        description:
          "End-to-end redesign of a B2B project management platform serving 50,000+ teams. Reduced onboarding time by 60% through progressive disclosure and contextual guidance.",
        coverImageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200",
        tags: ["SaaS", "Product Design", "Design System"],
        url: "https://horizonapp.io",
        order: 1,
        status: "published" as const,
      },
      {
        title: "Bloom Finance — Mobile Banking",
        client: "Bloom Finance",
        description:
          "Native-feel mobile web app for a challenger bank targeting Gen Z. Built with Next.js and a custom animation system. 4.8★ App Store rating at launch.",
        coverImageUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200",
        tags: ["Fintech", "Mobile", "React Native"],
        order: 2,
        status: "published" as const,
      },
      {
        title: "Petal Health — Patient Portal",
        client: "Petal Health",
        description:
          "HIPAA-compliant patient portal with appointment booking, lab results, and secure messaging. Passed WCAG 2.2 AA audit with zero violations.",
        coverImageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=1200",
        tags: ["Healthtech", "Accessibility", "Web App"],
        order: 3,
        status: "published" as const,
      },
    ]);

    console.log("seed complete: 1 settings, 3 posts, 4 team members, 4 testimonials, 3 portfolio entries");
  } finally {
    await close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
