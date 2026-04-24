import type { Metadata } from "next";
import Link from "next/link";
import { serverFetch } from "@/lib/api";
import type { TeamMember } from "@/lib/types";

export const metadata: Metadata = { title: "Team" };

export default async function TeamPage() {
  let members: TeamMember[] = [];
  try {
    members = await serverFetch<TeamMember[]>("/team");
  } catch {
    // unauthenticated or API unavailable
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Team</h1>
        <Link
          href="/team/new"
          className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90"
        >
          Add member
        </Link>
      </div>

      {members.length === 0 ? (
        <div className="rounded-xl border border-[var(--border)] px-6 py-12 text-center">
          <p className="text-sm text-[var(--muted-foreground)]">No team members yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {members.map((member) => (
            <Link
              key={member.id}
              href={`/team/${member.id}`}
              className="flex items-center gap-4 rounded-xl border border-[var(--border)] px-4 py-3 hover:bg-[var(--muted)] transition-colors"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 text-sm font-semibold text-white">
                {member.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium">{member.name}</p>
                <p className="text-xs text-[var(--muted-foreground)]">{member.title}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
