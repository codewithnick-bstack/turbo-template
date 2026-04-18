type HeroProps = {
  eyebrow?: string;
  heading: string;
  subheading?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export function Hero({ eyebrow, heading, subheading, ctaLabel, ctaHref }: HeroProps) {
  return (
    <section className="relative overflow-hidden px-6 py-24 md:py-32">
      <div className="mx-auto max-w-4xl text-center">
        {eyebrow ? (
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-6xl">{heading}</h1>
        {subheading ? (
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">{subheading}</p>
        ) : null}
        {ctaLabel && ctaHref ? (
          <a
            href={ctaHref}
            className="mt-8 inline-flex items-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
          >
            {ctaLabel}
          </a>
        ) : null}
      </div>
    </section>
  );
}
