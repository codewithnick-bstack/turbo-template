import { sql, inArray } from "drizzle-orm";
import { schema, type Db } from "@repo/db";
import type { SearchDoc, SearchHit, SearchIndex } from "./index";

export function createPostgresSearchIndex(db: Db): SearchIndex {
  return {
    async upsert(docs: SearchDoc[]) {
      if (docs.length === 0) return;
      for (const doc of docs) {
        await db
          .insert(schema.searchIndex)
          .values({
            id: doc.id,
            tenantId: doc.tenantId,
            siteId: doc.siteId,
            kind: doc.kind,
            title: doc.title,
            body: doc.body,
            url: doc.url,
          })
          .onConflictDoUpdate({
            target: schema.searchIndex.id,
            set: {
              title: doc.title,
              body: doc.body,
              url: doc.url,
              kind: doc.kind,
              updatedAt: new Date(),
            },
          });
      }
    },

    async delete(ids: string[]) {
      if (ids.length === 0) return;
      await db.delete(schema.searchIndex).where(inArray(schema.searchIndex.id, ids));
    },

    async query({ tenantId, query, limit = 20 }): Promise<SearchHit[]> {
      if (!query.trim()) return [];

      type Row = {
        id: string;
        tenant_id: string;
        site_id: string;
        kind: string;
        title: string;
        body: string;
        url: string;
        rank: number;
        snippet: string;
      };

      const rows = await db.execute<Row>(sql`
        SELECT
          id,
          tenant_id,
          site_id,
          kind,
          title,
          body,
          url,
          ts_rank(
            to_tsvector('english', title || ' ' || body),
            plainto_tsquery('english', ${query})
          ) AS rank,
          ts_headline(
            'english',
            body,
            plainto_tsquery('english', ${query}),
            'MaxFragments=1,MaxWords=20,MinWords=5'
          ) AS snippet
        FROM search_index
        WHERE
          tenant_id = ${tenantId}::uuid
          AND to_tsvector('english', title || ' ' || body) @@ plainto_tsquery('english', ${query})
        ORDER BY rank DESC
        LIMIT ${limit}
      `);

      return Array.from(rows).map((row) => ({
        doc: {
          id: row.id,
          tenantId: row.tenant_id,
          siteId: row.site_id,
          kind: row.kind as SearchDoc["kind"],
          title: row.title,
          body: row.body,
          url: row.url,
        },
        score: Number(row.rank),
        snippet: row.snippet,
      }));
    },
  };
}
