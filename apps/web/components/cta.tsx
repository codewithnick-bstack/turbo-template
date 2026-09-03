import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { hero } from "@/lib/site-data";
import { cn } from "@/lib/utils";

/**
 * The funnel's buttons. Both doors — Get Hired and Hire Today — render through
 * here so their proportions, hover, and focus ring are identical everywhere
 * they appear: hero, header, page bands, and the closing section.
 */

type Variant = "primary" | "outline" | "outlineDark";
type Size = "md" | "lg";

const BASE =
  "group inline-flex items-center justify-center gap-2 font-semibold tracking-wide transition-colors duration-[var(--duration-micro)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4";

const VARIANT: Record<Variant, string> = {
  primary:
    "bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] focus-visible:outline-[var(--accent)]",
  // For placing on the navy bands and over the hero scrim.
  outline:
    "border border-white/35 text-white backdrop-blur-sm hover:border-white hover:bg-white/10 focus-visible:outline-white",
  // For placing on light surfaces.
  outlineDark:
    "border border-[var(--navy)]/25 text-[var(--navy)] hover:bg-[var(--navy)] hover:text-white dark:border-white/25 dark:text-white dark:hover:bg-white/10",
};

const SIZE: Record<Size, string> = {
  md: "px-7 py-3.5 text-sm",
  lg: "px-9 py-4 text-base",
};

export function CtaLink({
  href,
  label,
  variant = "primary",
  size = "md",
  withArrow = false,
  onClick,
  className,
}: {
  href: string;
  label: string;
  variant?: Variant;
  size?: Size;
  withArrow?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  // Spread the handler in only when provided — passing an explicit
  // `onClick={undefined}` trips exactOptionalPropertyTypes against next/link's
  // MouseEventHandler prop type.
  const clickProps = onClick ? { onClick } : {};
  return (
    <Link
      href={href}
      {...clickProps}
      className={cn(BASE, VARIANT[variant], SIZE[size], className)}
    >
      {label}
      {withArrow ? (
        <ArrowRight
          className="size-4 transition-transform duration-[var(--duration-micro)] group-hover:translate-x-1"
          aria-hidden="true"
        />
      ) : null}
    </Link>
  );
}

/**
 * Both doors, side by side. The two-audience split is the business model, so
 * the pair travels together rather than being assembled per page.
 */
export function CtaPair({
  size = "lg",
  align = "start",
  onDark = true,
  className,
}: {
  size?: Size;
  align?: "start" | "center";
  /** Controls the secondary button only — the red primary is the same on both. */
  onDark?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row",
        align === "center" && "sm:justify-center",
        className,
      )}
    >
      <CtaLink
        href={hero.primaryCta.href}
        label={hero.primaryCta.label}
        variant="primary"
        size={size}
        withArrow
      />
      <CtaLink
        href={hero.secondaryCta.href}
        label={hero.secondaryCta.label}
        variant={onDark ? "outline" : "outlineDark"}
        size={size}
      />
    </div>
  );
}

/**
 * Understated text link with a red underline that extends on hover. Used where
 * a full button would over-weight the section.
 */
export function TextLink({
  href,
  label,
  onDark = false,
  className,
}: {
  href: string;
  label: string;
  onDark?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-2 pb-1 text-[0.8rem] font-bold tracking-[0.1em] uppercase",
        "border-b-2 border-[var(--accent)] transition-colors duration-[var(--duration-micro)]",
        onDark ? "text-white hover:border-white" : "text-[var(--navy)] dark:text-white",
        className,
      )}
    >
      {label}
      <ArrowRight
        className="size-3.5 transition-transform duration-[var(--duration-micro)] group-hover:translate-x-1"
        aria-hidden="true"
      />
    </Link>
  );
}
