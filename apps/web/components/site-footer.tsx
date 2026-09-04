import Link from "next/link";

import { ContactDetailLink } from "@/components/contact-detail-link";
import { CookieSettingsButton } from "@/components/cookie-settings-button";
import { OutboundLink } from "@/components/outbound-link";
import { siteConfig } from "@/lib/site-data";

export function SiteFooter() {
  return (
    <footer className="on-dark bg-[var(--navy-deep)] text-white/70">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-8">
        <div className="sm:col-span-2 lg:col-span-1">
          <p className="font-display text-lg leading-none font-bold tracking-[-0.02em]">
            <span className="text-white">S.R.</span>
            <span className="ml-1.5 text-[#f4564a]">Clarke</span>
          </p>
          <p className="mt-4 max-w-md text-sm leading-6">{siteConfig.description}</p>
          <div className="mt-5 space-y-1.5 text-sm">
            {siteConfig.email ? (
              <ContactDetailLink href={`mailto:${siteConfig.email}`} type="email" className="hover:text-white">
                {siteConfig.email}
              </ContactDetailLink>
            ) : null}
            {siteConfig.phone ? (
              <ContactDetailLink href={`tel:${siteConfig.phone}`} type="phone" className="hover:text-white">
                {siteConfig.phone}
              </ContactDetailLink>
            ) : null}
            {siteConfig.location ? <p>{siteConfig.location}</p> : null}
          </div>
        </div>

        <div>
          <p className="eyebrow text-white/50">Pages</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {siteConfig.nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="eyebrow text-white/50">More</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {siteConfig.footerExtra.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {siteConfig.socials.length > 0 ? (
          <div>
            <p className="eyebrow text-white/50">Social</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {siteConfig.socials.map((item) => (
                <li key={item.label}>
                  <OutboundLink href={item.href} source="footer_social" className="hover:text-white">
                    {item.label}
                  </OutboundLink>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
      <div className="border-t border-white/10 px-4 py-5 text-center text-sm text-white/45">
        <span>
          © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
        </span>
        <span className="mx-2">·</span>
        <CookieSettingsButton />
      </div>
    </footer>
  );
}
