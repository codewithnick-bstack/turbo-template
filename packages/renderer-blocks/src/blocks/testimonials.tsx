type Item = { quote: string; name: string; company?: string };

export function Testimonials({ heading, items }: { heading?: string; items: Item[] }) {
  return (
    <section className="px-6 py-16 md:py-24">
      <div className="mx-auto max-w-5xl">
        {heading ? <h2 className="text-3xl font-bold md:text-4xl">{heading}</h2> : null}
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {items.map((item, index) => (
            <figure key={index} className="rounded-lg border p-6">
              <blockquote className="text-sm">&ldquo;{item.quote}&rdquo;</blockquote>
              <figcaption className="mt-4 text-sm font-medium">
                {item.name}
                {item.company ? <span className="text-muted-foreground"> · {item.company}</span> : null}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
