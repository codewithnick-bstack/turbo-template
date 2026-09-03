import { cn } from "@/lib/utils";

/**
 * The page's vertical rhythm and its measures, in one place.
 *
 * Every route composes from these instead of re-typing padding and max-width
 * strings, which is what let the old pages drift apart from each other. The
 * three `space` weights are the whole scale — a page alternates them so it
 * reads as verses rather than one repeated interval.
 */

type Space = "tight" | "normal" | "loose";
type Tone = "default" | "muted" | "navy" | "deep";

const SPACE: Record<Space, string> = {
  tight: "py-14 lg:py-20",
  normal: "py-20 lg:py-28",
  loose: "py-24 lg:py-36",
};

const TONE: Record<Tone, string> = {
  default: "bg-[var(--background)]",
  muted: "bg-[var(--muted-bg)]",
  navy: "on-dark bg-[var(--navy)] text-white",
  deep: "on-dark bg-[var(--navy-deep)] text-white",
};

export function Section({
  children,
  className,
  space = "normal",
  tone = "default",
  bordered = false,
  ...rest
}: React.ComponentPropsWithoutRef<"section"> & {
  space?: Space;
  tone?: Tone;
  /** Hairline rule along the top and bottom edge. */
  bordered?: boolean;
}) {
  return (
    <section
      className={cn(
        SPACE[space],
        TONE[tone],
        bordered && "border-y border-[var(--border)]",
        className,
      )}
      {...rest}
    >
      {children}
    </section>
  );
}

/**
 * Measures. `wide` is the workhorse; `narrow` is for a column of prose, and
 * `full` for grids that should run closer to the viewport edge. Varying these
 * per section is what keeps 13 routes from looking like one template stamped
 * repeatedly.
 */
const MEASURE = {
  narrow: "max-w-3xl",
  wide: "max-w-6xl",
  full: "max-w-7xl",
} as const;

export function Container({
  children,
  className,
  measure = "wide",
}: {
  children: React.ReactNode;
  className?: string;
  measure?: keyof typeof MEASURE;
}) {
  return (
    <div className={cn("mx-auto px-4 sm:px-6 lg:px-8", MEASURE[measure], className)}>
      {children}
    </div>
  );
}
