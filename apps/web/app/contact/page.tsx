import type { Metadata } from "next";

import { ContactDetailLink } from "@/components/contact-detail-link";
import { ContactForm } from "@/components/contact-form";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { siteConfig } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Contact",
  description: "Send a project inquiry through the integrated Express backend.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact",
    description: "Send a project inquiry through the integrated Express backend.",
    url: "/contact",
    siteName: siteConfig.name,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Contact" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact",
    description: "Send a project inquiry through the integrated Express backend.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Contact" }],
  },
};

export default function ContactPage() {
  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-12 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8 lg:py-16">
      <Card className="h-fit">
        <Badge>Contact</Badge>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">Tell us about your next website</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
          The form posts to the Express backend at <code>/api/contact</code>, validates the payload, and can forward emails through Resend or Nodemailer.
        </p>
        <div className="mt-5 space-y-2 text-sm text-slate-600 dark:text-slate-300">
          {siteConfig.email ? (
              <ContactDetailLink href={`mailto:${siteConfig.email}`} type="email" className="text-indigo-600 hover:underline dark:text-indigo-400">
                {siteConfig.email}
              </ContactDetailLink>
            ) : null}
            {siteConfig.phone ? (
              <ContactDetailLink href={`tel:${siteConfig.phone}`} type="phone" className="text-indigo-600 hover:underline dark:text-indigo-400">
                {siteConfig.phone}
              </ContactDetailLink>
            ) : null}
            {siteConfig.location ? <p>{siteConfig.location}</p> : null}
        </div>
      </Card>

      <Card>
        <ContactForm />
      </Card>
    </div>
  );
}
