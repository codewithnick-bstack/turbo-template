type CtaProps = {
  heading: string;
  description?: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
};

export function Cta({
  heading,
  description,
  primaryCtaLabel,
  primaryCtaHref,
  secondaryCtaLabel,
  secondaryCtaHref,
}: CtaProps) {
  return (
    <section className="px-6 py-20 md:py-28">
      <div className="mx-auto max-w-3xl rounded-2xl border p-10 text-center">
        <h2 className="text-2xl font-bold md:text-3xl">{heading}</h2>
        {description ? <p className="mt-3 text-muted-foreground">{description}</p> : null}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <a
            href={primaryCtaHref}
            className="inline-flex items-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
          >
            {primaryCtaLabel}
          </a>
          {secondaryCtaLabel && secondaryCtaHref ? (
            <a
              href={secondaryCtaHref}
              className="inline-flex items-center rounded-full border px-6 py-3 text-sm font-semibold"
            >
              {secondaryCtaLabel}
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
