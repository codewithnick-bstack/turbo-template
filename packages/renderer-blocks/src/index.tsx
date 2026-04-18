import type { TBlockTree } from "@repo/schemas";
import { Hero } from "./blocks/hero";
import { Features } from "./blocks/features";
import { Cta } from "./blocks/cta";
import { Testimonials } from "./blocks/testimonials";
import { RichText } from "./blocks/richtext";
import { FormBlock } from "./blocks/form";
import { SearchBlock } from "./blocks/search";

type AnyBlock = { id: string; type: string; props: Record<string, unknown>; children?: AnyBlock[] };

const REGISTRY: Record<string, (props: Record<string, unknown>) => JSX.Element | null> = {
  hero: Hero as (p: Record<string, unknown>) => JSX.Element,
  features: Features as (p: Record<string, unknown>) => JSX.Element,
  cta: Cta as (p: Record<string, unknown>) => JSX.Element,
  testimonials: Testimonials as (p: Record<string, unknown>) => JSX.Element,
  richtext: RichText as (p: Record<string, unknown>) => JSX.Element,
  form: FormBlock as (p: Record<string, unknown>) => JSX.Element,
  search: SearchBlock as (p: Record<string, unknown>) => JSX.Element,
};

export function RenderBlocks({ tree }: { tree: TBlockTree }) {
  return (
    <>
      {tree.blocks.map((block) => {
        const b = block as AnyBlock;
        const Component = REGISTRY[b.type];
        if (!Component) {
          console.warn(`[renderer-blocks] unknown block type: ${b.type}`);
          return null;
        }
        return <Component key={b.id} {...b.props} />;
      })}
    </>
  );
}

export { Hero, Features, Cta, Testimonials, RichText, FormBlock, SearchBlock };
