import { Reveal } from "@/components/reveal";
import { Rule } from "@/components/rule";
import { StaggerWords } from "@/components/stagger-words";
import { cn } from "@/lib/utils";

/** Display sizes for section titles. `xl` is reserved for a page's one big moment. */
const SIZE = {
  md: "text-3xl sm:text-4xl",
  lg: "text-4xl sm:text-5xl",
  xl: "text-4xl sm:text-5xl lg:text-6xl",
} as const;

type SectionHeadingProps = {
  /** Small red uppercase label above the title. */
  eyebrow?: string;
  title: string;
  intro?: string;
  size?: keyof typeof SIZE;
  /** Set on the navy/deep bands so the copy inverts. */
  onDark?: boolean;
  /** Headings below the page's h1 are h2 by default; nested ones pass h3. */
  as?: "h2" | "h3";
  className?: string;
};

/**
 * Rule, eyebrow, title, intro — the block that opens nearly every section on
 * the site. Centralised so the type scale and the reveal timing stay identical
 * across all 13 routes; the title animates word by word, the rest fades up.
 */
export function SectionHeading({
  eyebrow,
  title,
  intro,
  size = "md",
  onDark = false,
  as = "h2",
  className,
}: SectionHeadingProps) {
  return (
    <div className={className}>
      <Reveal>
        <Rule />
        {eyebrow ? (
          <p className={cn("eyebrow mt-6", onDark && "text-white/55")}>{eyebrow}</p>
        ) : null}
      </Reveal>

      <StaggerWords
        as={as}
        text={title}
        className={cn(
          "font-display mt-5 font-semibold tracking-[-0.02em] text-balance",
          SIZE[size],
          onDark ? "text-white" : "text-[var(--navy)] dark:text-white",
        )}
      />

      {intro ? (
        <Reveal index={1}>
          <p
            className={cn(
              "mt-6 max-w-2xl text-lg leading-8",
              onDark ? "text-white/75" : "text-[var(--muted)]",
            )}
          >
            {intro}
          </p>
        </Reveal>
      ) : null}
    </div>
  );
}
