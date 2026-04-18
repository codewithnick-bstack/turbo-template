import { describe, expect, it } from "vitest";
import { Slug } from "./common";

describe("Slug", () => {
  it("accepts lowercase hyphenated", () => {
    expect(Slug.parse("demo-site")).toBe("demo-site");
    expect(Slug.parse("a")).toBe("a");
  });

  it("rejects leading/trailing hyphen", () => {
    expect(() => Slug.parse("-foo")).toThrow();
    expect(() => Slug.parse("foo-")).toThrow();
  });

  it("rejects uppercase and spaces", () => {
    expect(() => Slug.parse("Foo")).toThrow();
    expect(() => Slug.parse("foo bar")).toThrow();
  });
});
