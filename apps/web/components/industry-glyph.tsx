import { DrawIn } from "@/components/draw-in";
import { industryGlyphs } from "@/lib/industry-glyphs";

/**
 * The line-art mark for one industry, drawn stroke by stroke on scroll.
 *
 * Decorative: the tile it sits in already names the industry in a heading, so
 * repeating it here would just make screen readers say everything twice.
 */
export function IndustryGlyph({
  slug,
  className = "",
}: {
  slug: string;
  className?: string;
}) {
  const paths = industryGlyphs[slug];
  if (!paths) return null;

  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {paths.map((d, index) => (
        <DrawIn key={d} d={d} index={index} strokeWidth={1.75} />
      ))}
    </svg>
  );
}
