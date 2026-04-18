export function RichText({ html }: { html: string }) {
  return (
    <section className="prose mx-auto max-w-3xl px-6 py-12" dangerouslySetInnerHTML={{ __html: html }} />
  );
}
