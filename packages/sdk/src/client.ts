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
    get: () => this.request<unknown>("GET", "/v1/whoami"),
  };

  tenants = {
    current: () => this.request<unknown>("GET", "/v1/tenants/current"),
    children: () => this.request<unknown>("GET", "/v1/tenants/current/children"),
    create: (input: unknown) => this.request<unknown>("POST", "/v1/tenants", input),
  };

  sites = {
    list: () => this.request<{ data: unknown[] }>("GET", "/v1/sites"),
    create: (input: unknown) => this.request<unknown>("POST", "/v1/sites", input),
    get: (id: string) => this.request<unknown>("GET", `/v1/sites/${id}`),
    update: (id: string, input: unknown) => this.request<unknown>("PATCH", `/v1/sites/${id}`, input),
    bindDomain: (id: string, hostname: string) =>
      this.request<unknown>("POST", `/v1/sites/${id}/domain`, { hostname }),
  };

  pages = {
    list: (siteId: string) => this.request<{ data: unknown[] }>("GET", `/v1/pages?siteId=${siteId}`),
    create: (input: unknown) => this.request<unknown>("POST", "/v1/pages", input),
    get: (id: string) => this.request<unknown>("GET", `/v1/pages/${id}`),
    update: (id: string, input: unknown) => this.request<unknown>("PATCH", `/v1/pages/${id}`, input),
    publish: (id: string) => this.request<unknown>("POST", `/v1/pages/${id}/publish`),
    unpublish: (id: string) => this.request<unknown>("POST", `/v1/pages/${id}/unpublish`),
  };

  forms = {
    list: (siteId: string) => this.request<{ data: unknown[] }>("GET", `/v1/forms?siteId=${siteId}`),
    create: (input: unknown) => this.request<unknown>("POST", "/v1/forms", input),
    submit: (id: string, data: unknown) => this.request<unknown>("POST", `/v1/forms/${id}/submit`, data),
    submissions: (id: string, limit?: number) =>
      this.request<{ data: unknown[] }>("GET", `/v1/forms/${id}/submissions${limit ? `?limit=${limit}` : ""}`),
  };

  webhooks = {
    listSubscriptions: () => this.request<{ data: unknown[] }>("GET", "/v1/webhooks/subscriptions"),
    subscribe: (input: unknown) => this.request<unknown>("POST", "/v1/webhooks/subscriptions", input),
    listDeliveries: (limit?: number) =>
      this.request<{ data: unknown[] }>("GET", `/v1/webhooks/deliveries${limit ? `?limit=${limit}` : ""}`),
    replay: (input: unknown) => this.request<unknown>("POST", "/v1/webhooks/replay", input),
  };

  billing = {
    checkEntitlement: (capability: string) =>
      this.request<unknown>("GET", `/v1/billing/entitlements?capability=${capability}`),
    setPlan: (plan: "starter" | "pro" | "agency") => this.request<unknown>("POST", "/v1/billing/plan", { plan }),
  };

  collections = {
    list: (siteId: string) => this.request<{ data: unknown[] }>("GET", `/v1/collections?siteId=${siteId}`),
    create: (input: unknown) => this.request<unknown>("POST", "/v1/collections", input),
  };

  entries = {
    list: (collectionId: string, status?: "draft" | "published") =>
      this.request<{ data: unknown[] }>(
        "GET",
        `/v1/entries?collectionId=${collectionId}${status ? `&status=${status}` : ""}`,
      ),
    create: (input: unknown) => this.request<unknown>("POST", "/v1/entries", input),
  };

  search = {
    query: (q: string, limit?: number) => {
      const params = new URLSearchParams({ q });
      if (limit) params.set("limit", String(limit));
      return this.request<{ data: unknown[] }>("GET", `/v1/search?${params}`);
    },
  };

  ai = {
    complete: (input: unknown) => this.request<unknown>("POST", "/v1/ai/complete", input),
    embed: (input: string | string[]) => this.request<{ embeddings: number[][] }>("POST", "/v1/ai/embed", { input }),
  };

  media = {
    list: (siteId?: string, limit?: number) => {
      const params = new URLSearchParams();
      if (siteId) params.set("siteId", siteId);
      if (limit) params.set("limit", String(limit));
      const qs = params.toString();
      return this.request<{ data: unknown[] }>("GET", `/v1/media${qs ? `?${qs}` : ""}`);
    },
    presign: (input: unknown) => this.request<unknown>("POST", "/v1/media/presign", input),
    finalize: (input: unknown) => this.request<unknown>("POST", "/v1/media/finalize", input),
  };

  analytics = {
    ingest: (tenantId: string, input: unknown) =>
      this.request<unknown>("POST", `/v1/analytics/events?tid=${tenantId}`, input),
    get: (siteId: string, days?: number) => {
      const params = new URLSearchParams({ siteId });
      if (days) params.set("days", String(days));
      return this.request<unknown>("GET", `/v1/analytics?${params}`);
    },
  };

  blog = {
    listPosts: (siteId: string, status?: string) => {
      const params = new URLSearchParams({ siteId });
      if (status) params.set("status", status);
      return this.request<{ data: unknown[] }>("GET", `/v1/blog/posts?${params}`);
    },
    createPost: (input: unknown) => this.request<unknown>("POST", "/v1/blog/posts", input),
    getPost: (id: string) => this.request<unknown>("GET", `/v1/blog/posts/${id}`),
    updatePost: (id: string, input: unknown) =>
      this.request<unknown>("PATCH", `/v1/blog/posts/${id}`, input),
    publishPost: (id: string) => this.request<unknown>("POST", `/v1/blog/posts/${id}/publish`),
    deletePost: (id: string) => this.request<unknown>("DELETE", `/v1/blog/posts/${id}`),
  };

  members = {
    list: () => this.request<{ data: unknown[] }>("GET", "/v1/members"),
    invite: (email: string, role?: string) =>
      this.request<unknown>("POST", "/v1/members/invite", { email, role }),
    remove: (userId: string) => this.request<unknown>("DELETE", `/v1/members/${userId}`),
    updateRole: (userId: string, role: string) =>
      this.request<unknown>("PATCH", `/v1/members/${userId}`, { role }),
    listInvites: () => this.request<{ data: unknown[] }>("GET", "/v1/members/invites"),
    revokeInvite: (id: string) => this.request<unknown>("DELETE", `/v1/members/invites/${id}`),
    getInviteInfo: (token: string) =>
      this.request<unknown>("GET", `/v1/members/invite/info?token=${encodeURIComponent(token)}`),
    acceptInvite: (token: string, name?: string) =>
      this.request<unknown>("POST", "/v1/members/invite/accept", { token, name }),
  };

  branding = {
    get: () => this.request<unknown>("GET", "/v1/branding"),
    update: (input: unknown) => this.request<unknown>("PATCH", "/v1/branding", input),
  };

  templates = {
    list: (category?: string, limit?: number) => {
      const params = new URLSearchParams();
      if (category) params.set("category", category);
      if (limit) params.set("limit", String(limit));
      const qs = params.toString();
      return this.request<{ data: unknown[] }>("GET", `/v1/templates${qs ? `?${qs}` : ""}`);
    },
    get: (id: string) => this.request<unknown>("GET", `/v1/templates/${id}`),
    create: (input: unknown) => this.request<unknown>("POST", "/v1/templates", input),
    use: (id: string, input: { name: string; slug: string }) =>
      this.request<unknown>("POST", `/v1/templates/${id}/use`, input),
  };

  aiAssistant = {
    chat: (siteId: string, messages: Array<{ role: string; content: string }>) =>
      this.request<{ text: string }>("POST", "/v1/ai/chat", { siteId, messages }),
    generateBlogPost: (input: unknown) =>
      this.request<{ content: string }>("POST", "/v1/ai/generate/blog-post", input),
    generateSectionCopy: (input: unknown) =>
      this.request<{ props: unknown }>("POST", "/v1/ai/generate/section-copy", input),
    seoAudit: (pageId: string) =>
      this.request<{ findings: unknown[] }>("POST", "/v1/ai/seo/audit", { pageId }),
    seoGenerateMeta: (pageId: string) =>
      this.request<{ metaTitle?: string; metaDescription?: string }>(
        "POST",
        "/v1/ai/seo/generate-meta",
        { pageId },
      ),
  };
}
