import type { Metadata } from "next";

import { ContactForm } from "@/components/contact-form";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { siteConfig } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Contact",
  description: "Send a project inquiry through the integrated Express backend.",
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
          <p>{siteConfig.email}</p>
          <p>{siteConfig.phone}</p>
          <p>{siteConfig.location}</p>
        </div>
      </Card>

      <Card>
        <ContactForm />
      </Card>
    </div>
  );
}
