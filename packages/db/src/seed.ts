import { createDb } from "./client";
import { tenants, users, memberships, sites, pages } from "./schema";

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

    console.log("seed complete:", { tenant: demoTenant.slug, site: demoSite.slug });
  } finally {
    await close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
