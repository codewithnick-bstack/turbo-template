import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Platform Docs",
  description: "API, MCP, and SDK reference.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
