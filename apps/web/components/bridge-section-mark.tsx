import { DrawIn } from "@/components/draw-in";
import { bridgeSection } from "@/lib/drawn-marks";

/**
 * A bridge drawn as a section: deck, piers, the arch beneath, and the hangers
 * between the two. Wider and shorter than the skyline, so it suits a slim
 * band rather than a section floor.
 *
 * Same hand as {@link SkylineDivider} and the industry glyphs — an elevation,
 * not a picture.
 */
export function BridgeSectionMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1200 120"
      className={className}
      // Uniform scale: stretching a narrow box to full width flattens the
      // arch and thins the verticals. The artwork is drawn wide instead.
      preserveAspectRatio="xMidYMax meet"
      aria-hidden="true"
      focusable="false"
    >
      {bridgeSection.map((d, index) => (
        <DrawIn key={`${index}-${d}`} d={d} index={index} strokeWidth={1.5} duration={0.8} stagger={0.07} />
      ))}
    </svg>
  );
}
