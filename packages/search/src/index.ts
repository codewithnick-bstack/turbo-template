export type SearchDoc = {
  id: string;
  tenantId: string;
  siteId: string;
  kind: "page" | "post" | "entry" | "media";
  title: string;
  body: string;
  url: string;
};

export type SearchHit = {
  doc: SearchDoc;
  score: number;
  snippet?: string;
};

export interface SearchIndex {
  upsert(docs: SearchDoc[]): Promise<void>;
  delete(ids: string[]): Promise<void>;
  query(q: { tenantId: string; query: string; limit?: number }): Promise<SearchHit[]>;
}

export function reciprocalRankFusion(lists: SearchHit[][], k = 60): SearchHit[] {
  const acc = new Map<string, SearchHit & { rrf: number }>();
  for (const list of lists) {
    list.forEach((hit, rank) => {
      const existing = acc.get(hit.doc.id);
      const contribution = 1 / (k + rank);
      if (existing) {
        existing.rrf += contribution;
      } else {
        acc.set(hit.doc.id, { ...hit, rrf: contribution });
      }
    });
  }
  return [...acc.values()]
    .sort((a, b) => b.rrf - a.rrf)
    .map(({ rrf: _rrf, ...hit }) => hit);
}

export { createPostgresSearchIndex } from "./postgres";
