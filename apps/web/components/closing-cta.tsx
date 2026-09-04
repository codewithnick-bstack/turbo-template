import { CtaPair } from "@/components/cta";
import { Container, Section } from "@/components/section";
import { SectionHeading } from "@/components/section-heading";

/**
 * The centred "one conversation" close that ends the pages which have no
 * image band of their own.
 *
 * Extracted because /testimonials and /portfolio carried a byte-identical
 * copy of it — same rule, same heading, same CTA pair — hand-rolled rather
 * than built on SectionHeading, which meant these two closings were the only
 * section headings on the site that did not get the shared word-by-word
 * reveal.
 */
export function ClosingCta({
  title = "One conversation tells you whether we can help.",
}: {
  title?: string;
}) {
  return (
    <Section tone="muted" bordered>
      <Container measure="narrow" className="text-center">
        {/* Rule is nested inside SectionHeading's Reveal, so a child
            selector on this wrapper cannot reach it — SectionHeading
            centres its own rule when told to. */}
        <SectionHeading title={title} size="md" centered />
        <CtaPair size="lg" align="center" onDark={false} className="mt-10" />
      </Container>
    </Section>
  );
}
