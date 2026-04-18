import { describe, expect, it } from "vitest";
import { reciprocalRankFusion, type SearchHit } from "./index";

const doc = (id: string) => ({
  id,
  tenantId: "t",
  siteId: "s",
  kind: "page" as const,
  title: id,
  body: "",
  url: `/${id}`,
});

describe("reciprocalRankFusion", () => {
  it("combines two lists and ranks shared docs higher", () => {
    const listA: SearchHit[] = [
      { doc: doc("a"), score: 1 },
      { doc: doc("b"), score: 0.8 },
    ];
    const listB: SearchHit[] = [
      { doc: doc("b"), score: 1 },
      { doc: doc("c"), score: 0.5 },
    ];
    const fused = reciprocalRankFusion([listA, listB]);
    expect(fused[0]?.doc.id).toBe("b");
    expect(fused.map((h) => h.doc.id)).toEqual(["b", "a", "c"]);
  });
});
