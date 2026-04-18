import { createHash, randomUUID } from "node:crypto";
import { eq, and, desc } from "drizzle-orm";
import { schema } from "@repo/db";
import { AppError } from "@repo/observability";
import { z } from "zod";
import { defineContract } from "../parity";
import type { ServiceContext } from "../context";
import { emitEvent } from "../events";

export const presignUploadContract = defineContract({
  operation: "media.presign_upload",
  description: "Issue a presigned upload URL for a new media asset.",
  http: { method: "POST", path: "/v1/media/presign" },
  mcp: { tool: "presign_media_upload" },
});

export const finalizeMediaContract = defineContract({
  operation: "media.finalize",
  description: "Confirm upload, persist metadata, and emit media.uploaded.",
  http: { method: "POST", path: "/v1/media/finalize" },
  mcp: { tool: "finalize_media" },
  webhook: { event: "media.uploaded" },
});

export const listMediaContract = defineContract({
  operation: "media.list",
  description: "List media for a tenant or site.",
  idempotent: true,
  http: { method: "GET", path: "/v1/media" },
  mcp: { tool: "list_media" },
});

const PresignInput = z.object({
  siteId: z.string().uuid().optional(),
  filename: z.string().min(1),
  mimeType: z.string().min(1),
  sizeBytes: z.number().int().nonnegative(),
});

const FinalizeInput = z.object({
  siteId: z.string().uuid().optional(),
  storageKey: z.string().min(1),
  originalFilename: z.string().min(1),
  mimeType: z.string().min(1),
  sizeBytes: z.number().int().nonnegative(),
  kind: z.enum(["image", "video", "document"]).default("image"),
  width: z.number().int().optional(),
  height: z.number().int().optional(),
  altText: z.string().optional(),
  contentHash: z.string().optional(),
});

export async function presignUpload(ctx: ServiceContext, input: unknown) {
  const parsed = PresignInput.parse(input);
  if (parsed.sizeBytes > 50 * 1024 * 1024) {
    throw new AppError("unprocessable", "file exceeds 50MB upload limit");
  }
  const ext = parsed.filename.split(".").pop() ?? "bin";
  const storageKey = `tenants/${ctx.tenantId}/${randomUUID()}.${ext}`;

  const r2Url = await generateR2PresignedUrl(storageKey, parsed.mimeType);
  return {
    storageKey,
    url: r2Url,
    method: "PUT" as const,
    headers: { "content-type": parsed.mimeType },
  };
}

export async function finalizeMedia(ctx: ServiceContext, input: unknown) {
  const parsed = FinalizeInput.parse(input);
  const hash =
    parsed.contentHash ??
    createHash("sha256").update(`${parsed.storageKey}:${parsed.sizeBytes}`).digest("hex");

  const [row] = await ctx.db
    .insert(schema.media)
    .values({
      tenantId: ctx.tenantId,
      siteId: parsed.siteId ?? null,
      kind: parsed.kind,
      originalFilename: parsed.originalFilename,
      mimeType: parsed.mimeType,
      sizeBytes: parsed.sizeBytes,
      width: parsed.width ?? null,
      height: parsed.height ?? null,
      altText: parsed.altText ?? null,
      contentHash: hash,
      storageKey: parsed.storageKey,
    })
    .returning();
  if (!row) throw new AppError("internal", "media insert returned no row");

  await emitEvent({
    db: ctx.db,
    tenantId: ctx.tenantId,
    event: "media.uploaded",
    payload: { mediaId: row.id, kind: row.kind, storageKey: row.storageKey },
  });

  return row;
}

async function generateR2PresignedUrl(key: string, contentType: string): Promise<string> {
  const accountId = process.env.R2_ACCOUNT_ID;
  const bucket = process.env.R2_BUCKET;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !bucket || !accessKeyId || !secretAccessKey) {
    return `https://local-r2-stub/${key}`;
  }

  // Build S3-compatible presigned URL for Cloudflare R2
  const endpoint = `https://${accountId}.r2.cloudflarestorage.com`;
  const url = new URL(`/${bucket}/${key}`, endpoint);
  url.searchParams.set("X-Amz-Expires", "3600");

  const now = new Date();
  const dateStr = now.toISOString().replace(/[:-]|\.\d{3}/g, "").slice(0, 15) + "Z";
  const dateShort = dateStr.slice(0, 8);

  url.searchParams.set("X-Amz-Algorithm", "AWS4-HMAC-SHA256");
  url.searchParams.set("X-Amz-Credential", `${accessKeyId}/${dateShort}/auto/s3/aws4_request`);
  url.searchParams.set("X-Amz-Date", dateStr);
  url.searchParams.set("X-Amz-SignedHeaders", "host");

  const stringToSign = [
    "AWS4-HMAC-SHA256",
    dateStr,
    `${dateShort}/auto/s3/aws4_request`,
    "UNSIGNED-PAYLOAD",
  ].join("\n");

  const hmac = async (key: ArrayBuffer | Uint8Array, data: string) => {
    const { createHmac } = await import("node:crypto");
    return createHmac("sha256", Buffer.from(key as Uint8Array)).update(data).digest();
  };
  const k1 = await hmac(new TextEncoder().encode("AWS4" + secretAccessKey), dateShort);
  const k2 = await hmac(k1, "auto");
  const k3 = await hmac(k2, "s3");
  const signingKey = await hmac(k3, "aws4_request");
  const sig = (await hmac(signingKey, stringToSign)).toString("hex");

  url.searchParams.set("X-Amz-Signature", sig);
  url.searchParams.set("Content-Type", contentType);

  return url.toString();
}

export function getPublicUrl(storageKey: string): string {
  const publicUrl = process.env.R2_PUBLIC_URL;
  if (publicUrl) return `${publicUrl}/${storageKey}`;
  return `https://local-r2-stub/${storageKey}`;
}

export async function listMedia(ctx: ServiceContext, filter: { siteId?: string; limit?: number }) {
  const conditions = [eq(schema.media.tenantId, ctx.tenantId)];
  if (filter.siteId) conditions.push(eq(schema.media.siteId, filter.siteId));
  return ctx.db
    .select()
    .from(schema.media)
    .where(and(...conditions))
    .orderBy(desc(schema.media.createdAt))
    .limit(Math.min(filter.limit ?? 50, 200));
}
