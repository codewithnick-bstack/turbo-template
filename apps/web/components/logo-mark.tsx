import { logoMarks } from "@/lib/logo-marks";

/**
 * Renders one candidate logo mark in a single colour.
 *
 * `currentColor` throughout, so the mark inherits whatever the wordmark beside
 * it is using and follows the theme without a second set of tokens. Decorative
 * by default: the link it sits in already carries the company name for
 * screen readers.
 */
export function LogoMark({
  variant,
  className = "",
  style,
}: {
  variant: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const mark = logoMarks.find((m) => m.key === variant);
  if (!mark) return null;

  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      {...(style ? { style } : {})}
      aria-hidden="true"
      focusable="false"
    >
      {mark.fills?.map((d) => (
        <path
          key={d}
          d={d}
          fill="currentColor"
          {...(mark.fillRule ? { fillRule: mark.fillRule } : {})}
        />
      ))}
      {mark.strokes?.map((d) => (
        <path
          key={d}
          d={d}
          fill="none"
          stroke="currentColor"
          strokeWidth={mark.strokeWidth ?? 3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}
