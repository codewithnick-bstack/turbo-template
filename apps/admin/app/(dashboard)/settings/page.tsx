import type { Metadata } from "next";
import { serverFetch } from "@/lib/api";
import type { SiteSettings } from "@/lib/types";
import { SettingsForm } from "./settings-form";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  let settings: SiteSettings | null = null;
  try {
    settings = await serverFetch<SiteSettings>("/settings");
  } catch {
    // API unavailable
  }

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">Settings</h1>
      <SettingsForm settings={settings} />
    </div>
  );
}
