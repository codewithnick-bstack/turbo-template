import type {
  TSite,
  TPage,
  TForm,
  TFormSubmission,
  TMedia,
  TCollection,
  TEntry,
  TWebhookSubscription,
  TTenant,
  TUser,
  TMembership,
} from "@repo/schemas";

export type TBlogPost = {
  id: string;
  siteId: string;
  title: string;
  slug: string;
  content: string | null;
  excerpt: string | null;
  status: "draft" | "published" | "archived";
  tags: string[];
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TBranding = {
  logoUrl?: string | null;
  faviconUrl?: string | null;
  primaryColor?: string | null;
  accentColor?: string | null;
  customCss?: string | null;
  supportEmail?: string | null;
  privacyUrl?: string | null;
  termsUrl?: string | null;
};

export type TTemplate = {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  category: string;
  tags: string[];
};

export type TAuditEntry = {
  id: string;
  actorKind: string;
  actorId: string;
  action: string;
  resourceKind: string;
  resourceId: string;
  createdAt: string;
};

type ClientOptions = {
  baseUrl: string;
  apiKey?: string;
  sessionToken?: string;
  fetchImpl?: typeof fetch;
};

export class PlatformClient {
  private readonly baseUrl: string;
  private readonly headers: Record<string, string>;
  private readonly fetchImpl: typeof fetch;

  constructor(options: ClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, "");
    this.headers = {
      "content-type": "application/json",
      ...(options.apiKey ? { authorization: `Bearer ${options.apiKey}` } : {}),
      ...(options.sessionToken ? { cookie: `session=${options.sessionToken}` } : {}),
    };
    this.fetchImpl = options.fetchImpl ?? globalThis.fetch;
  }

  async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const res = await this.fetchImpl(`${this.baseUrl}${path}`, {
      method,
      headers: this.headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`PlatformClient ${method} ${path} -> ${res.status}: ${text}`);
    }
    return (await res.json()) as T;
  }

  whoami = {
    get: () => this.request<{ user: TUser; membership: TMembership }>("GET", "/v1/whoami"),
  };

  tenants = {
    current: () => this.request<TTenant>("GET", "/v1/tenants/current"),
    children: () => this.request<{ data: TTenant[] }>("GET", "/v1/tenants/current/children"),
    create: (input: unknown) => this.request<TTenant>("POST", "/v1/tenants", input),
  };

  agency = {
    listClients: () => this.request<{ data: TTenant[] }>("GET", "/v1/agency/clients"),
    createClient: (input: { name: string; slug: string }) =>
      this.request<TTenant>("POST", "/v1/agency/clients", input),
    getClient: (clientId: string) => this.request<TTenant>("GET", `/v1/agency/clients/${clientId}`),
    updateClient: (clientId: string, input: { name?: string }) =>
      this.request<TTenant>("PATCH", `/v1/agency/clients/${clientId}`, input),
    removeClient: (clientId: string) =>
      this.request<{ deleted: string }>("DELETE", `/v1/agency/clients/${clientId}`),
  };

  sites = {
    list: () => this.request<{ data: TSite[] }>("GET", "/v1/sites"),
    create: (input: unknown) => this.request<TSite>("POST", "/v1/sites", input),
    get: (id: string) => this.request<TSite>("GET", `/v1/sites/${id}`),
    update: (id: string, input: unknown) => this.request<TSite>("PATCH", `/v1/sites/${id}`, input),
    delete: (id: string) => this.request<{ deleted: string }>("DELETE", `/v1/sites/${id}`),
    bindDomain: (id: string, hostname: string) =>
      this.request<{ hostname: string; verificationToken: string }>("POST", `/v1/sites/${id}/domain`, { hostname }),
  };

  pages = {
    list: (siteId: string) => this.request<{ data: TPage[] }>("GET", `/v1/pages?siteId=${siteId}`),
    create: (input: unknown) => this.request<TPage>("POST", "/v1/pages", input),
    get: (id: string) => this.request<TPage>("GET", `/v1/pages/${id}`),
    update: (id: string, input: unknown) => this.request<TPage>("PATCH", `/v1/pages/${id}`, input),
    publish: (id: string) => this.request<TPage>("POST", `/v1/pages/${id}/publish`),
    unpublish: (id: string) => this.request<TPage>("POST", `/v1/pages/${id}/unpublish`),
    delete: (id: string) => this.request<{ deleted: string }>("DELETE", `/v1/pages/${id}`),
  };

  forms = {
    list: (siteId: string) => this.request<{ data: TForm[] }>("GET", `/v1/forms?siteId=${siteId}`),
    create: (input: unknown) => this.request<TForm>("POST", "/v1/forms", input),
    get: (id: string) => this.request<TForm>("GET", `/v1/forms/${id}`),
    delete: (id: string) => this.request<{ deleted: string }>("DELETE", `/v1/forms/${id}`),
    submit: (id: string, data: unknown) => this.request<{ id: string; ok: boolean }>("POST", `/v1/forms/${id}/submit`, data),
    submissions: (id: string, limit?: number) =>
      this.request<{ data: TFormSubmission[] }>("GET", `/v1/forms/${id}/submissions${limit ? `?limit=${limit}` : ""}`),
  };

  webhooks = {
    listSubscriptions: () => this.request<{ data: TWebhookSubscription[] }>("GET", "/v1/webhooks/subscriptions"),
    subscribe: (input: unknown) => this.request<TWebhookSubscription>("POST", "/v1/webhooks/subscriptions", input),
    unsubscribe: (id: string) => this.request<{ deleted: string }>("DELETE", `/v1/webhooks/subscriptions/${id}`),
    listDeliveries: (limit?: number) =>
      this.request<{ data: unknown[] }>("GET", `/v1/webhooks/deliveries${limit ? `?limit=${limit}` : ""}`),
    replay: (input: unknown) => this.request<{ replayed: number }>("POST", "/v1/webhooks/replay", input),
  };

  apiKeys = {
    list: () => this.request<{ data: Array<{ id: string; name: string; prefix: string; scopes: string[]; lastUsedAt: string | null; createdAt: string }> }>("GET", "/v1/api-keys"),
    create: (input: { name: string; scopes?: string[] }) =>
      this.request<{ id: string; name: string; prefix: string; key: string; createdAt: string }>("POST", "/v1/api-keys", input),
    revoke: (id: string) => this.request<{ deleted: string }>("DELETE", `/v1/api-keys/${id}`),
  };

  billing = {
    checkEntitlement: (capability: string) =>
      this.request<{ entitled: boolean; usage?: number; limit?: number }>("GET", `/v1/billing/entitlements?capability=${capability}`),
    setPlan: (plan: "starter" | "pro" | "agency") => this.request<{ plan: string }>("POST", "/v1/billing/plan", { plan }),
    createPortalSession: (input: unknown) => this.request<{ url: string }>("POST", "/v1/billing/portal", input),
    createCheckoutSession: (input: unknown) => this.request<{ url: string }>("POST", "/v1/billing/checkout", input),
  };

  collections = {
    list: (siteId: string) => this.request<{ data: TCollection[] }>("GET", `/v1/collections?siteId=${siteId}`),
    create: (input: unknown) => this.request<TCollection>("POST", "/v1/collections", input),
  };

  entries = {
    list: (collectionId: string, status?: "draft" | "published") =>
      this.request<{ data: TEntry[] }>(
        "GET",
        `/v1/entries?collectionId=${collectionId}${status ? `&status=${status}` : ""}`,
      ),
    get: (id: string) => this.request<TEntry>("GET", `/v1/entries/${id}`),
    create: (input: unknown) => this.request<TEntry>("POST", "/v1/entries", input),
    update: (id: string, input: unknown) => this.request<TEntry>("PATCH", `/v1/entries/${id}`, input),
  };

  search = {
    query: (q: string, limit?: number) => {
      const params = new URLSearchParams({ q });
      if (limit) params.set("limit", String(limit));
      return this.request<{ data: unknown[] }>("GET", `/v1/search?${params}`);
    },
  };

  ai = {
    complete: (input: unknown) => this.request<{ text: string; usage?: { inputTokens: number; outputTokens: number } }>("POST", "/v1/ai/complete", input),
    embed: (input: string | string[]) => this.request<{ embeddings: number[][] }>("POST", "/v1/ai/embed", { input }),
  };

  media = {
    list: (siteId?: string, limit?: number) => {
      const params = new URLSearchParams();
      if (siteId) params.set("siteId", siteId);
      if (limit) params.set("limit", String(limit));
      const qs = params.toString();
      return this.request<{ data: TMedia[] }>("GET", `/v1/media${qs ? `?${qs}` : ""}`);
    },
    presign: (input: unknown) =>
      this.request<{ storageKey: string; url: string; method: string; headers: Record<string, string> }>("POST", "/v1/media/presign", input),
    finalize: (input: unknown) => this.request<TMedia>("POST", "/v1/media/finalize", input),
    delete: (id: string) => this.request<{ deleted: string }>("DELETE", `/v1/media/${id}`),
  };

  analytics = {
    ingest: (tenantId: string, input: unknown) =>
      this.request<{ ok: boolean }>("POST", `/v1/analytics/events?tid=${tenantId}`, input),
    get: (siteId: string, days?: number) => {
      const params = new URLSearchParams({ siteId });
      if (days) params.set("days", String(days));
      return this.request<{
        pageViews: number;
        uniqueVisitors: number;
        topPages: Array<{ path: string | null; views: number }>;
        dailyViews: Array<{ date: string; views: number }>;
      }>("GET", `/v1/analytics?${params}`);
    },
  };

  blog = {
    listPosts: (siteId: string, status?: string) => {
      const params = new URLSearchParams({ siteId });
      if (status) params.set("status", status);
      return this.request<{ data: TBlogPost[] }>("GET", `/v1/blog/posts?${params}`);
    },
    createPost: (input: unknown) => this.request<TBlogPost>("POST", "/v1/blog/posts", input),
    getPost: (id: string) => this.request<TBlogPost>("GET", `/v1/blog/posts/${id}`),
    updatePost: (id: string, input: unknown) =>
      this.request<TBlogPost>("PATCH", `/v1/blog/posts/${id}`, input),
    publishPost: (id: string) => this.request<TBlogPost>("POST", `/v1/blog/posts/${id}/publish`),
    deletePost: (id: string) => this.request<{ deleted: string }>("DELETE", `/v1/blog/posts/${id}`),
  };

  members = {
    list: () => this.request<{ data: TMembership[] }>("GET", "/v1/members"),
    invite: (email: string, role?: string) =>
      this.request<{ id: string; email: string; role: string; expiresAt: string }>("POST", "/v1/members/invite", { email, role }),
    remove: (userId: string) => this.request<{ deleted: string }>("DELETE", `/v1/members/${userId}`),
    updateRole: (userId: string, role: string) =>
      this.request<TMembership>("PATCH", `/v1/members/${userId}`, { role }),
    listInvites: () => this.request<{ data: Array<{ id: string; email: string; role: string; expiresAt: string }> }>("GET", "/v1/members/invites"),
    revokeInvite: (id: string) => this.request<{ deleted: string }>("DELETE", `/v1/members/invites/${id}`),
    getInviteInfo: (token: string) =>
      this.request<{ email: string; role: string; expiresAt: string }>("GET", `/v1/members/invite/info?token=${encodeURIComponent(token)}`),
    acceptInvite: (token: string, name?: string) =>
      this.request<{ ok: boolean }>("POST", "/v1/members/invite/accept", { token, name }),
  };

  branding = {
    get: () => this.request<TBranding>("GET", "/v1/branding"),
    update: (input: unknown) => this.request<TBranding>("PATCH", "/v1/branding", input),
  };

  templates = {
    list: (category?: string, limit?: number) => {
      const params = new URLSearchParams();
      if (category) params.set("category", category);
      if (limit) params.set("limit", String(limit));
      const qs = params.toString();
      return this.request<{ data: TTemplate[] }>("GET", `/v1/templates${qs ? `?${qs}` : ""}`);
    },
    get: (id: string) => this.request<TTemplate>("GET", `/v1/templates/${id}`),
    create: (input: unknown) => this.request<TTemplate>("POST", "/v1/templates", input),
    use: (id: string, input: { name: string; slug: string }) =>
      this.request<TSite>("POST", `/v1/templates/${id}/use`, input),
  };

  aiAssistant = {
    chat: (siteId: string, messages: Array<{ role: string; content: string }>) =>
      this.request<{ text: string }>("POST", "/v1/ai/chat", { siteId, messages }),
    generateBlogPost: (input: unknown) =>
      this.request<{ content: string }>("POST", "/v1/ai/generate/blog-post", input),
    generateSectionCopy: (input: unknown) =>
      this.request<{ props: unknown }>("POST", "/v1/ai/generate/section-copy", input),
    generateAltText: (input: { mediaId: string; siteId?: string }) =>
      this.request<{ altText: string }>("POST", "/v1/ai/generate/alt-text", input),
    seoAudit: (pageId: string) =>
      this.request<{ findings: unknown[] }>("POST", "/v1/ai/seo/audit", { pageId }),
    seoGenerateMeta: (pageId: string) =>
      this.request<{ metaTitle?: string; metaDescription?: string }>(
        "POST",
        "/v1/ai/seo/generate-meta",
        { pageId },
      ),
  };

  compliance = {
    exportData: () =>
      this.request<{ data: Record<string, unknown> }>("POST", "/v1/compliance/export"),
    deleteTenant: () =>
      this.request<{ scheduled: true; purgeAfterDays: number }>("DELETE", "/v1/compliance/tenant"),
  };

  audit = {
    list: (opts?: { limit?: number; offset?: number; resourceKind?: string; since?: string }) => {
      const params = new URLSearchParams();
      if (opts?.limit) params.set("limit", String(opts.limit));
      if (opts?.offset) params.set("offset", String(opts.offset));
      if (opts?.resourceKind) params.set("resourceKind", opts.resourceKind);
      if (opts?.since) params.set("since", opts.since);
      const qs = params.toString();
      return this.request<{ data: TAuditEntry[]; limit: number; offset: number }>(
        "GET",
        `/v1/audit${qs ? `?${qs}` : ""}`,
      );
    },
  };
}
