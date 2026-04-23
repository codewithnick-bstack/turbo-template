import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import "./globals.css";

export const metadata: Metadata = {
  title: "Platform Admin",
  description: "Build, manage, and ship agent-native sites.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0d10" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className="min-h-dvh bg-background text-foreground antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
          <Toaster richColors position="bottom-right" />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
