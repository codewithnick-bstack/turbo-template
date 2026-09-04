import { DrawIn } from "@/components/draw-in";
import { processMarks } from "@/lib/drawn-marks";

/**
 * A line mark for one step of the search process, drawn stroke by stroke.
 *
 * Decorative — every step it labels already has a heading, so giving these a
 * label would only make a screen reader read each step twice.
 */
export function ProcessMark({
  name,
  className = "",
}: {
  name: keyof typeof processMarks | string;
  className?: string;
}) {
  const paths = processMarks[name];
  if (!paths) return null;

  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {paths.map((d, index) => (
        <DrawIn key={`${index}-${d}`} d={d} index={index} strokeWidth={1.75} duration={0.75} stagger={0.09} />
      ))}
    </svg>
  );
}
