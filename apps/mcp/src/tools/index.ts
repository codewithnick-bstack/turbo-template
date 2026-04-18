import { PlatformClient } from "@repo/sdk";

export type ToolContext = { apiKey: string; tenantId: string; baseUrl: string };

export function clientFor(ctx: ToolContext) {
  const fetchWithHeaders: typeof fetch = (input, init) =>
    fetch(input, {
      ...init,
      headers: {
        ...(init?.headers ?? {}),
        authorization: `Bearer ${ctx.apiKey}`,
        "x-tenant-id": ctx.tenantId,
        "x-user-id": "mcp-agent",
        "x-role": "owner",
      },
    });
  return new PlatformClient({ baseUrl: ctx.baseUrl, fetchImpl: fetchWithHeaders });
}

type ToolDef = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations?: Record<string, unknown>;
  handler: (input: unknown, ctx: ToolContext) => Promise<unknown>;
};

export const toolDefinitions: ToolDef[] = [
  // ── Whoami ────────────────────────────────────────────────────────────
  {
    name: "whoami",
    description: "Return the authenticated user and active membership.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    handler: (_input, ctx) => clientFor(ctx).whoami.get(),
  },

  // ── Tenants ───────────────────────────────────────────────────────────
  {
    name: "get_tenant",
    description: "Get the current tenant.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    handler: (_input, ctx) => clientFor(ctx).tenants.current(),
  },
  {
    name: "create_tenant",
    description: "Create a new tenant (direct, agency, or client).",
    inputSchema: {
      type: "object",
      required: ["slug", "name"],
      properties: {
        slug: { type: "string" },
        name: { type: "string" },
        type: { type: "string", enum: ["direct", "agency", "client"] },
        parentTenantId: { type: "string" },
      },
    },
    handler: (input, ctx) => clientFor(ctx).tenants.create(input),
  },

  // ── Sites ─────────────────────────────────────────────────────────────
  {
    name: "list_sites",
    description: "List sites belonging to the authenticated tenant.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    handler: (_input, ctx) => clientFor(ctx).sites.list(),
  },
  {
    name: "get_site",
    description: "Get a site by id.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: { id: { type: "string" } },
    },
    handler: (input, ctx) => clientFor(ctx).sites.get((input as { id: string }).id),
  },
  {
    name: "create_site",
    description: "Create a new site within the authenticated tenant.",
    inputSchema: {
      type: "object",
      required: ["slug", "name"],
      properties: {
        slug: { type: "string" },
        name: { type: "string" },
        description: { type: "string" },
      },
    },
    handler: (input, ctx) => clientFor(ctx).sites.create(input),
  },
  {
    name: "update_site",
    description: "Update site metadata.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string" },
        name: { type: "string" },
        slug: { type: "string" },
        description: { type: "string" },
      },
    },
    handler: (input, ctx) => {
      const { id, ...patch } = input as { id: string; [k: string]: unknown };
      return clientFor(ctx).sites.update(id, patch);
    },
  },
  {
    name: "bind_domain",
    description: "Bind a custom domain to a site; issues a verification token.",
    inputSchema: {
      type: "object",
      required: ["siteId", "hostname"],
      properties: {
        siteId: { type: "string" },
        hostname: { type: "string" },
      },
    },
    handler: (input, ctx) => {
      const { siteId, hostname } = input as { siteId: string; hostname: string };
      return clientFor(ctx).sites.bindDomain(siteId, hostname);
    },
  },

  // ── Pages ─────────────────────────────────────────────────────────────
  {
    name: "list_pages",
    description: "List pages in a site.",
    inputSchema: {
      type: "object",
      required: ["siteId"],
      properties: { siteId: { type: "string" } },
    },
    handler: (input, ctx) => clientFor(ctx).pages.list((input as { siteId: string }).siteId),
  },
  {
    name: "get_page",
    description: "Get a page by id.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: { id: { type: "string" } },
    },
    handler: (input, ctx) => clientFor(ctx).pages.get((input as { id: string }).id),
  },
  {
    name: "create_page",
    description: "Create a new page within a site (draft by default).",
    inputSchema: {
      type: "object",
      required: ["siteId", "slug", "title"],
      properties: {
        siteId: { type: "string" },
        slug: { type: "string" },
        title: { type: "string" },
        description: { type: "string" },
        locale: { type: "string" },
        content: { type: "object" },
      },
    },
    handler: (input, ctx) => clientFor(ctx).pages.create(input),
  },
  {
    name: "update_page",
    description: "Update a page's metadata or draft content.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string" },
        title: { type: "string" },
        slug: { type: "string" },
        description: { type: "string" },
        content: { type: "object" },
      },
    },
    handler: (input, ctx) => {
      const { id, ...patch } = input as { id: string; [k: string]: unknown };
      return clientFor(ctx).pages.update(id, patch);
    },
  },
  {
    name: "publish_page",
    description: "Publish a page — promotes draft content to live. Requires approval.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: { id: { type: "string" } },
    },
    annotations: { destructive: true, requiresApproval: true },
    handler: (input, ctx) => clientFor(ctx).pages.publish((input as { id: string }).id),
  },
  {
    name: "unpublish_page",
    description: "Return a page to draft-only state. Requires approval.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: { id: { type: "string" } },
    },
    annotations: { destructive: true, requiresApproval: true },
    handler: (input, ctx) => clientFor(ctx).pages.unpublish((input as { id: string }).id),
  },

  // ── Forms ─────────────────────────────────────────────────────────────
  {
    name: "list_forms",
    description: "List forms for a site.",
    inputSchema: {
      type: "object",
      required: ["siteId"],
      properties: { siteId: { type: "string" } },
    },
    handler: (input, ctx) => clientFor(ctx).forms.list((input as { siteId: string }).siteId),
  },
  {
    name: "create_form",
    description: "Create a new form definition attached to a site.",
    inputSchema: {
      type: "object",
      required: ["siteId", "name", "fields"],
      properties: {
        siteId: { type: "string" },
        name: { type: "string" },
        fields: { type: "array" },
        captcha: { type: "boolean" },
        deliverEmails: { type: "array", items: { type: "string" } },
        deliverWebhookUrl: { type: "string" },
      },
    },
    handler: (input, ctx) => clientFor(ctx).forms.create(input),
  },
  {
    name: "submit_form",
    description: "Submit a form on behalf of a visitor.",
    inputSchema: {
      type: "object",
      required: ["formId", "data"],
      properties: {
        formId: { type: "string" },
        data: { type: "object", additionalProperties: true },
      },
    },
    handler: (input, ctx) => {
      const { formId, data } = input as { formId: string; data: Record<string, unknown> };
      return clientFor(ctx).forms.submit(formId, data);
    },
  },
  {
    name: "list_form_submissions",
    description: "List submissions for a form.",
    inputSchema: {
      type: "object",
      required: ["formId"],
      properties: {
        formId: { type: "string" },
        limit: { type: "number" },
      },
    },
    handler: (input, ctx) => {
      const { formId, limit } = input as { formId: string; limit?: number };
      return clientFor(ctx).forms.submissions(formId, limit);
    },
  },

  // ── Collections / Entries ─────────────────────────────────────────────
  {
    name: "list_collections",
    description: "List content collections for a site.",
    inputSchema: {
      type: "object",
      required: ["siteId"],
      properties: { siteId: { type: "string" } },
    },
    handler: (input, ctx) =>
      clientFor(ctx).collections.list((input as { siteId: string }).siteId),
  },
  {
    name: "create_collection",
    description: "Create a content collection (content type).",
    inputSchema: {
      type: "object",
      required: ["siteId", "slug", "name", "fields"],
      properties: {
        siteId: { type: "string" },
        slug: { type: "string" },
        name: { type: "string" },
        fields: { type: "array" },
      },
    },
    handler: (input, ctx) => clientFor(ctx).collections.create(input),
  },
  {
    name: "list_entries",
    description: "List entries in a collection.",
    inputSchema: {
      type: "object",
      required: ["collectionId"],
      properties: {
        collectionId: { type: "string" },
        status: { type: "string", enum: ["draft", "published"] },
      },
    },
    handler: (input, ctx) => {
      const { collectionId, status } = input as { collectionId: string; status?: "draft" | "published" };
      return clientFor(ctx).entries.list(collectionId, status);
    },
  },
  {
    name: "create_entry",
    description: "Create a content entry within a collection.",
    inputSchema: {
      type: "object",
      required: ["collectionId", "slug", "data"],
      properties: {
        collectionId: { type: "string" },
        slug: { type: "string" },
        locale: { type: "string" },
        status: { type: "string", enum: ["draft", "published"] },
        data: { type: "object", additionalProperties: true },
      },
    },
    handler: (input, ctx) => clientFor(ctx).entries.create(input),
  },

  // ── Media ─────────────────────────────────────────────────────────────
  {
    name: "list_media",
    description: "List media assets for a tenant or site.",
    inputSchema: {
      type: "object",
      properties: {
        siteId: { type: "string" },
        limit: { type: "number" },
      },
    },
    handler: (input, ctx) => {
      const { siteId, limit } = input as { siteId?: string; limit?: number };
      return clientFor(ctx).media.list(siteId, limit);
    },
  },
  {
    name: "presign_media_upload",
    description: "Issue a presigned upload URL for a new media asset.",
    inputSchema: {
      type: "object",
      required: ["filename", "mimeType", "sizeBytes"],
      properties: {
        siteId: { type: "string" },
        filename: { type: "string" },
        mimeType: { type: "string" },
        sizeBytes: { type: "number" },
      },
    },
    handler: (input, ctx) => clientFor(ctx).media.presign(input),
  },
  {
    name: "finalize_media",
    description: "Confirm upload complete, persist metadata, emit media.uploaded.",
    inputSchema: {
      type: "object",
      required: ["storageKey", "originalFilename", "mimeType", "sizeBytes"],
      properties: {
        siteId: { type: "string" },
        storageKey: { type: "string" },
        originalFilename: { type: "string" },
        mimeType: { type: "string" },
        sizeBytes: { type: "number" },
        kind: { type: "string", enum: ["image", "video", "document"] },
        width: { type: "number" },
        height: { type: "number" },
        altText: { type: "string" },
      },
    },
    handler: (input, ctx) => clientFor(ctx).media.finalize(input),
  },

  // ── Webhooks ──────────────────────────────────────────────────────────
  {
    name: "list_webhook_subscriptions",
    description: "List webhook subscriptions for the tenant.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    handler: (_input, ctx) => clientFor(ctx).webhooks.listSubscriptions(),
  },
  {
    name: "subscribe_webhook",
    description: "Create a webhook subscription for specific events.",
    inputSchema: {
      type: "object",
      required: ["url", "events"],
      properties: {
        url: { type: "string" },
        events: { type: "array", items: { type: "string" } },
      },
    },
    handler: (input, ctx) => clientFor(ctx).webhooks.subscribe(input),
  },
  {
    name: "list_webhook_deliveries",
    description: "List recent webhook delivery attempts.",
    inputSchema: {
      type: "object",
      properties: { limit: { type: "number" } },
    },
    handler: (input, ctx) =>
      clientFor(ctx).webhooks.listDeliveries((input as { limit?: number }).limit),
  },
  {
    name: "replay_webhook",
    description: "Replay webhook deliveries over a time window. Requires approval.",
    inputSchema: {
      type: "object",
      required: ["sinceIsoDate"],
      properties: {
        sinceIsoDate: { type: "string" },
        subscriptionId: { type: "string" },
      },
    },
    annotations: { destructive: true, requiresApproval: true },
    handler: (input, ctx) => clientFor(ctx).webhooks.replay(input),
  },

  // ── Search ────────────────────────────────────────────────────────────
  {
    name: "search",
    description: "Full-text search across all site content for the tenant.",
    inputSchema: {
      type: "object",
      required: ["q"],
      properties: {
        q: { type: "string" },
        limit: { type: "number" },
      },
    },
    handler: async (input, ctx) => {
      const { q, limit } = input as { q: string; limit?: number };
      const params = new URLSearchParams({ q });
      if (limit) params.set("limit", String(limit));
      const c = clientFor(ctx);
      return c.request("GET", `/v1/search?${params}`);
    },
  },

  // ── AI ────────────────────────────────────────────────────────────────
  {
    name: "ai_complete",
    description: "Run an AI completion using the platform's configured model adapter.",
    inputSchema: {
      type: "object",
      required: ["messages"],
      properties: {
        system: { type: "string" },
        messages: { type: "array" },
        maxTokens: { type: "number" },
        temperature: { type: "number" },
      },
    },
    handler: async (input, ctx) => clientFor(ctx).request("POST", "/v1/ai/complete", input),
  },

  // ── Billing ───────────────────────────────────────────────────────────
  {
    name: "check_entitlement",
    description: "Check whether a tenant is entitled to a capability or within a quota.",
    inputSchema: {
      type: "object",
      required: ["capability"],
      properties: { capability: { type: "string" } },
    },
    handler: (input, ctx) =>
      clientFor(ctx).billing.checkEntitlement((input as { capability: string }).capability),
  },
  {
    name: "set_plan",
    description: "Set the tenant plan. Admin-only; production is Stripe-driven. Requires approval.",
    inputSchema: {
      type: "object",
      required: ["plan"],
      properties: { plan: { type: "string", enum: ["starter", "pro", "agency"] } },
    },
    annotations: { requiresApproval: true },
    handler: (input, ctx) =>
      clientFor(ctx).billing.setPlan((input as { plan: "starter" | "pro" | "agency" }).plan),
  },

  // ── Blog ─────────────────────────────────────────────────────────────
  {
    name: "list_blog_posts",
    description: "List blog posts for a site.",
    inputSchema: {
      type: "object",
      required: ["siteId"],
      properties: {
        siteId: { type: "string" },
        status: { type: "string", enum: ["draft", "published", "archived"] },
      },
    },
    handler: (input, ctx) => {
      const { siteId, status } = input as { siteId: string; status?: string };
      return clientFor(ctx).blog.listPosts(siteId, status);
    },
  },
  {
    name: "create_blog_post",
    description: "Create a new blog post (draft by default).",
    inputSchema: {
      type: "object",
      required: ["siteId", "title", "slug"],
      properties: {
        siteId: { type: "string" },
        title: { type: "string" },
        slug: { type: "string" },
        content: { type: "string" },
        excerpt: { type: "string" },
        tags: { type: "array", items: { type: "string" } },
      },
    },
    handler: (input, ctx) => clientFor(ctx).blog.createPost(input),
  },
  {
    name: "publish_blog_post",
    description: "Publish a blog post by ID.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: { id: { type: "string" } },
    },
    handler: (input, ctx) => clientFor(ctx).blog.publishPost((input as { id: string }).id),
  },

  // ── Analytics ─────────────────────────────────────────────────────────
  {
    name: "get_analytics",
    description: "Get aggregated analytics for a site.",
    inputSchema: {
      type: "object",
      required: ["siteId"],
      properties: {
        siteId: { type: "string" },
        days: { type: "number" },
      },
    },
    handler: (input, ctx) => {
      const { siteId, days } = input as { siteId: string; days?: number };
      return clientFor(ctx).analytics.get(siteId, days);
    },
  },
];
