import Link from "next/link";

import { CookieSettingsButton } from "@/components/cookie-settings-button";
import { OutboundLink } from "@/components/outbound-link";
import { siteConfig } from "@/lib/site-data";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-950/70">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-8">
        <div className="sm:col-span-2 lg:col-span-1">
          <p className="text-lg font-semibold">{siteConfig.name}</p>
          <p className="mt-3 max-w-md text-sm text-slate-600 dark:text-slate-300">{siteConfig.description}</p>
          <div className="mt-4 space-y-1 text-sm text-slate-600 dark:text-slate-300">
            <p>{siteConfig.email}</p>
            <p>{siteConfig.phone}</p>
            <p>{siteConfig.location}</p>
          </div>
        </div>

        <div>
          <p className="font-semibold">Pages</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
            {siteConfig.nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-slate-900 dark:hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-semibold">More</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
            {siteConfig.footerExtra.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-slate-900 dark:hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-semibold">Social</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
            {siteConfig.socials.map((item) => (
              <li key={item.label}>
                <OutboundLink href={item.href} source="footer_social" className="hover:text-slate-900 dark:hover:text-white">
                  {item.label}
                </OutboundLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-200 px-4 py-4 text-center text-sm text-slate-500 dark:border-slate-800">
        <span>© {new Date().getFullYear()} {siteConfig.name}. Built with Next.js, Express, and Turborepo.</span>
        <span className="mx-2">·</span>
        <CookieSettingsButton />
      </div>
    </footer>
  );
}
