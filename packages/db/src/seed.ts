import { createDb } from "./client";
import { tenants, users, memberships, sites, pages, templates } from "./schema";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }

  const { db, close } = createDb({ url });

  try {
    const [demoTenant] = await db
      .insert(tenants)
      .values({ slug: "demo", name: "Demo Studio", type: "direct" })
      .returning();
    if (!demoTenant) throw new Error("tenant insert failed");

    const [demoUser] = await db
      .insert(users)
      .values({ email: "owner@demo.local", name: "Demo Owner" })
      .returning();
    if (!demoUser) throw new Error("user insert failed");

    await db.insert(memberships).values({
      userId: demoUser.id,
      tenantId: demoTenant.id,
      role: "owner",
    });

    const [demoSite] = await db
      .insert(sites)
      .values({
        tenantId: demoTenant.id,
        slug: "demo-site",
        name: "Demo Studio Site",
        description: "Seeded demo content",
      })
      .returning();
    if (!demoSite) throw new Error("site insert failed");

    await db.insert(pages).values({
      tenantId: demoTenant.id,
      siteId: demoSite.id,
      slug: "home",
      title: "Home",
      status: "published",
      publishedAt: new Date(),
      content: {
        version: 1,
        blocks: [
          {
            id: "hero-1",
            type: "hero",
            props: {
              heading: "Beautiful client sites, shipped fast",
              subheading: "An agent-native platform for agencies and small businesses.",
              ctaLabel: "Start a project",
              ctaHref: "/contact",
            },
          },
        ],
      },
    });

    await seedTemplates(db);

    console.log("seed complete:", { tenant: demoTenant.slug, site: demoSite.slug });
  } finally {
    await close();
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function seedTemplates(db: any) {
  const TEMPLATES = [
    {
      slug: "landing-saas",
      name: "SaaS Landing Page",
      description: "High-converting landing page with hero, features, pricing, and CTA sections.",
      category: "landing",
      tags: ["saas", "startup", "marketing"],
      pageTree: {
        pages: [
          {
            slug: "home",
            title: "Home",
            blocks: [
              { type: "hero", props: { heading: "Ship faster with [Product]", subheading: "The all-in-one platform for modern teams.", ctaLabel: "Start free trial", ctaHref: "/signup" } },
              { type: "features", props: { heading: "Everything you need", items: [{ icon: "zap", title: "Fast", body: "Deploy in seconds, not hours." }, { icon: "shield", title: "Secure", body: "SOC 2 Type II certified." }, { icon: "bar-chart", title: "Analytics", body: "Real-time insights built in." }] } },
              { type: "pricing", props: { heading: "Simple pricing", tiers: [{ name: "Starter", price: "$0", features: ["3 sites", "1 user", "Community support"] }, { name: "Pro", price: "$49/mo", features: ["Unlimited sites", "5 users", "Priority support"] }, { name: "Agency", price: "$199/mo", features: ["Everything in Pro", "Client workspaces", "White label"] }] } },
              { type: "cta", props: { heading: "Ready to get started?", subheading: "Join thousands of teams shipping with [Product].", buttonLabel: "Start for free", buttonHref: "/signup" } },
            ],
          },
        ],
      },
    },
    {
      slug: "blog-magazine",
      name: "Blog & Magazine",
      description: "Editorial-style blog with featured posts, categories, and newsletter signup.",
      category: "blog",
      tags: ["blog", "content", "editorial"],
      pageTree: {
        pages: [
          {
            slug: "home",
            title: "Home",
            blocks: [
              { type: "hero", props: { heading: "Stories worth reading", subheading: "Insights, tutorials, and deep dives." } },
              { type: "post-grid", props: { heading: "Latest posts", limit: 6 } },
              { type: "newsletter", props: { heading: "Stay in the loop", subheading: "Get weekly articles delivered to your inbox." } },
            ],
          },
        ],
      },
    },
    {
      slug: "portfolio-creative",
      name: "Creative Portfolio",
      description: "Showcase your work with a clean grid layout, case studies, and contact form.",
      category: "portfolio",
      tags: ["portfolio", "creative", "freelancer"],
      pageTree: {
        pages: [
          {
            slug: "home",
            title: "Home",
            blocks: [
              { type: "hero", props: { heading: "Hi, I'm [Name]", subheading: "Designer & developer crafting digital experiences.", ctaLabel: "View my work", ctaHref: "#work" } },
              { type: "work-grid", props: { heading: "Selected work", columns: 2 } },
              { type: "about", props: { heading: "About me", body: "I've worked with startups and enterprises to ship products people love." } },
              { type: "contact-form", props: { heading: "Let's work together", subheading: "Drop me a message and I'll get back within 24 hours." } },
            ],
          },
        ],
      },
    },
    {
      slug: "restaurant-menu",
      name: "Restaurant & Menu",
      description: "Beautiful restaurant site with menu, gallery, reservations, and location.",
      category: "hospitality",
      tags: ["restaurant", "food", "hospitality"],
      pageTree: {
        pages: [
          {
            slug: "home",
            title: "Home",
            blocks: [
              { type: "hero", props: { heading: "Fresh. Local. Delicious.", subheading: "Open Tuesday–Sunday, 12pm–10pm.", ctaLabel: "Reserve a table", ctaHref: "/reservations" } },
              { type: "menu-preview", props: { heading: "Our menu", categories: ["Starters", "Mains", "Desserts", "Drinks"] } },
              { type: "gallery", props: { heading: "A taste of the experience", columns: 3 } },
              { type: "map-location", props: { heading: "Find us", address: "123 Main Street, Your City" } },
            ],
          },
        ],
      },
    },
    {
      slug: "agency-services",
      name: "Agency Services",
      description: "Full-service agency site with services, case studies, team, and lead capture.",
      category: "agency",
      tags: ["agency", "services", "b2b"],
      pageTree: {
        pages: [
          {
            slug: "home",
            title: "Home",
            blocks: [
              { type: "hero", props: { heading: "We build brands that grow", subheading: "Strategy, design, and engineering under one roof.", ctaLabel: "Start a project", ctaHref: "/contact" } },
              { type: "services-grid", props: { heading: "What we do", services: ["Brand Strategy", "Web Design", "Development", "SEO", "Paid Media", "Analytics"] } },
              { type: "case-studies", props: { heading: "Recent work", limit: 3 } },
              { type: "team", props: { heading: "Meet the team" } },
              { type: "contact-form", props: { heading: "Start a project", subheading: "Tell us about your goals." } },
            ],
          },
        ],
      },
    },
    {
      slug: "ecommerce-storefront",
      name: "Storefront",
      description: "Clean e-commerce layout with product grid, cart, and checkout flow.",
      category: "ecommerce",
      tags: ["shop", "ecommerce", "products"],
      pageTree: {
        pages: [
          {
            slug: "home",
            title: "Home",
            blocks: [
              { type: "hero", props: { heading: "Quality made to last", subheading: "Free shipping on orders over $75.", ctaLabel: "Shop now", ctaHref: "/products" } },
              { type: "product-grid", props: { heading: "Featured products", limit: 8, filter: "featured" } },
              { type: "promo-banner", props: { text: "Use code WELCOME10 for 10% off your first order." } },
              { type: "newsletter", props: { heading: "Get early access", subheading: "Be the first to know about new drops and exclusive offers." } },
            ],
          },
        ],
      },
    },
  ];

  await db.insert(templates).values(TEMPLATES).onConflictDoNothing();
  console.log("templates seeded:", TEMPLATES.length);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
