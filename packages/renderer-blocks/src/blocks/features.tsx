type Item = { title: string; description: string; icon?: string };

export function Features({ heading, items }: { heading?: string; items: Item[] }) {
  return (
    <section className="px-6 py-16 md:py-24">
      <div className="mx-auto max-w-5xl">
        {heading ? <h2 className="text-3xl font-bold md:text-4xl">{heading}</h2> : null}
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {items.map((item, index) => (
            <div key={index} className="rounded-lg border p-6">
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
