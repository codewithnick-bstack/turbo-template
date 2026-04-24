import { Router } from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";
import type { Db } from "@repo/db";
import * as blogService from "./services/blog";
import * as teamService from "./services/team";
import * as testimonialsService from "./services/testimonials";
import * as portfolioService from "./services/portfolio";
import * as contactsService from "./services/contacts";
import * as settingsService from "./services/settings";
import { env } from "./env";

function createMcpServer(db: Db) {
  const mcp = new McpServer({ name: "website-template", version: "1.0.0" });

  // Blog tools
  mcp.registerTool("list_blog_posts", {
    description: "List all blog posts (including drafts)",
  }, async () => {
    const posts = await blogService.listBlogPosts(db, { includeAll: true });
    return { content: [{ type: "text" as const, text: JSON.stringify(posts, null, 2) }] };
  });

  mcp.registerTool("get_blog_post", {
    description: "Get a blog post by ID",
    inputSchema: { id: z.string().uuid() },
  }, async ({ id }) => {
    const post = await blogService.getBlogPostById(db, id);
    return { content: [{ type: "text" as const, text: JSON.stringify(post, null, 2) }] };
  });

  mcp.registerTool("create_blog_post", {
    description: "Create a new blog post",
    inputSchema: {
      slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
      title: z.string().min(1),
      content: z.string().default(""),
      excerpt: z.string().optional(),
      author: z.string().optional(),
      coverImageUrl: z.string().url().optional(),
    },
  }, async (args) => {
    const post = await blogService.createBlogPost(db, args);
    return { content: [{ type: "text" as const, text: JSON.stringify(post, null, 2) }] };
  });

  mcp.registerTool("update_blog_post", {
    description: "Update an existing blog post",
    inputSchema: {
      id: z.string().uuid(),
      title: z.string().optional(),
      content: z.string().optional(),
      excerpt: z.string().optional(),
    },
  }, async ({ id, ...data }) => {
    const post = await blogService.updateBlogPost(db, id, data);
    return { content: [{ type: "text" as const, text: JSON.stringify(post, null, 2) }] };
  });

  mcp.registerTool("publish_blog_post", {
    description: "Publish a blog post",
    inputSchema: { id: z.string().uuid() },
  }, async ({ id }) => {
    const post = await blogService.publishBlogPost(db, id);
    return { content: [{ type: "text" as const, text: JSON.stringify(post, null, 2) }] };
  });

  // Team tools
  mcp.registerTool("list_team", {
    description: "List all team members",
  }, async () => {
    const members = await teamService.listTeamMembers(db);
    return { content: [{ type: "text" as const, text: JSON.stringify(members, null, 2) }] };
  });

  mcp.registerTool("add_team_member", {
    description: "Add a new team member",
    inputSchema: {
      name: z.string().min(1),
      title: z.string().min(1),
      bio: z.string().optional(),
      photoUrl: z.string().url().optional(),
      linkedinUrl: z.string().url().optional(),
      twitterUrl: z.string().url().optional(),
    },
  }, async (args) => {
    const member = await teamService.createTeamMember(db, { ...args, order: 0 });
    return { content: [{ type: "text" as const, text: JSON.stringify(member, null, 2) }] };
  });

  mcp.registerTool("update_team_member", {
    description: "Update a team member",
    inputSchema: { id: z.string().uuid(), name: z.string().optional(), title: z.string().optional(), bio: z.string().optional() },
  }, async ({ id, ...data }) => {
    const member = await teamService.updateTeamMember(db, id, data);
    return { content: [{ type: "text" as const, text: JSON.stringify(member, null, 2) }] };
  });

  mcp.registerTool("remove_team_member", {
    description: "Remove a team member",
    inputSchema: { id: z.string().uuid() },
  }, async ({ id }) => {
    await teamService.deleteTeamMember(db, id);
    return { content: [{ type: "text" as const, text: `Team member ${id} deleted` }] };
  });

  // Testimonials tools
  mcp.registerTool("list_testimonials", {
    description: "List all testimonials",
  }, async () => {
    const items = await testimonialsService.listTestimonials(db);
    return { content: [{ type: "text" as const, text: JSON.stringify(items, null, 2) }] };
  });

  mcp.registerTool("add_testimonial", {
    description: "Add a new testimonial",
    inputSchema: {
      authorName: z.string().min(1),
      quote: z.string().min(1),
      company: z.string().optional(),
      role: z.string().optional(),
      rating: z.number().int().min(1).max(5).default(5),
      featured: z.boolean().default(false),
    },
  }, async (args) => {
    const t = await testimonialsService.createTestimonial(db, args);
    return { content: [{ type: "text" as const, text: JSON.stringify(t, null, 2) }] };
  });

  mcp.registerTool("update_testimonial", {
    description: "Update a testimonial",
    inputSchema: { id: z.string().uuid(), quote: z.string().optional(), featured: z.boolean().optional() },
  }, async ({ id, ...data }) => {
    const t = await testimonialsService.updateTestimonial(db, id, data);
    return { content: [{ type: "text" as const, text: JSON.stringify(t, null, 2) }] };
  });

  // Portfolio tools
  mcp.registerTool("list_portfolio", {
    description: "List all portfolio entries",
  }, async () => {
    const entries = await portfolioService.listPortfolioEntries(db, { includeAll: true });
    return { content: [{ type: "text" as const, text: JSON.stringify(entries, null, 2) }] };
  });

  mcp.registerTool("add_portfolio_entry", {
    description: "Add a new portfolio entry",
    inputSchema: {
      title: z.string().min(1),
      client: z.string().optional(),
      description: z.string().optional(),
      coverImageUrl: z.string().url().optional(),
      tags: z.array(z.string()).default([]),
      status: z.enum(["draft", "published"]).default("draft"),
    },
  }, async (args) => {
    const entry = await portfolioService.createPortfolioEntry(db, { ...args, order: 0, images: [] });
    return { content: [{ type: "text" as const, text: JSON.stringify(entry, null, 2) }] };
  });

  mcp.registerTool("update_portfolio_entry", {
    description: "Update a portfolio entry",
    inputSchema: { id: z.string().uuid(), title: z.string().optional(), description: z.string().optional(), status: z.enum(["draft", "published"]).optional() },
  }, async ({ id, ...data }) => {
    const entry = await portfolioService.updatePortfolioEntry(db, id, data);
    return { content: [{ type: "text" as const, text: JSON.stringify(entry, null, 2) }] };
  });

  // Contact tools
  mcp.registerTool("list_contacts", {
    description: "List contact form submissions",
  }, async () => {
    const contacts = await contactsService.listContacts(db);
    return { content: [{ type: "text" as const, text: JSON.stringify(contacts, null, 2) }] };
  });

  mcp.registerTool("get_contact", {
    description: "Get a contact submission by ID",
    inputSchema: { id: z.string().uuid() },
  }, async ({ id }) => {
    const contact = await contactsService.getContact(db, id);
    return { content: [{ type: "text" as const, text: JSON.stringify(contact, null, 2) }] };
  });

  mcp.registerTool("archive_contact", {
    description: "Archive a contact submission",
    inputSchema: { id: z.string().uuid() },
  }, async ({ id }) => {
    const contact = await contactsService.archiveContact(db, id);
    return { content: [{ type: "text" as const, text: JSON.stringify(contact, null, 2) }] };
  });

  // Settings tools
  mcp.registerTool("get_site_settings", {
    description: "Get the current site settings",
  }, async () => {
    const settings = await settingsService.getSettings(db);
    return { content: [{ type: "text" as const, text: JSON.stringify(settings, null, 2) }] };
  });

  mcp.registerTool("update_site_settings", {
    description: "Update site settings",
    inputSchema: {
      businessName: z.string().optional(),
      tagline: z.string().optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      seoTitle: z.string().optional(),
      seoDescription: z.string().optional(),
    },
  }, async (args) => {
    const settings = await settingsService.updateSettings(db, args);
    return { content: [{ type: "text" as const, text: JSON.stringify(settings, null, 2) }] };
  });

  return mcp;
}

export function createMcpRouter(db: Db) {
  const router = Router();
  const mcp = createMcpServer(db);

  // Bearer token auth for MCP — key required; no key = endpoint disabled
  router.use((req, res, next) => {
    const mcpKey = env.MCP_API_KEY;
    if (!mcpKey) {
      res.status(503).json({ code: "unavailable", message: "MCP endpoint not configured" });
      return;
    }
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ") || authHeader.slice(7) !== mcpKey) {
      res.status(401).json({ code: "unauthorized", message: "Invalid MCP API key" });
      return;
    }
    next();
  });

  async function handleMcpRequest(req: import("express").Request, res: import("express").Response, body?: unknown) {
    // Stateless mode: empty options = no session persistence
    const transport = new StreamableHTTPServerTransport({});
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await mcp.server.connect(transport as any);
    if (body !== undefined) {
      await transport.handleRequest(req, res, body);
    } else {
      await transport.handleRequest(req, res);
    }
  }

  router.post("/", async (req, res) => { await handleMcpRequest(req, res, req.body); });
  router.get("/", async (req, res) => { await handleMcpRequest(req, res); });
  router.delete("/", async (req, res) => { await handleMcpRequest(req, res); });

  return router;
}
