import { getApiClient } from "@/lib/api";
import { InviteForm } from "./invite-form";
import { RemoveMemberButton, RevokeInviteButton } from "./members-actions";

type Member = {
  userId: string;
  email: string | null;
  name: string | null;
  role: string;
  createdAt: string;
};

type Invite = { id: string; email: string; role: string; expiresAt: string };

export default async function MembersPage() {
  const api = getApiClient();
  let members: Member[] = [];
  let invites: Invite[] = [];

  try {
    const [mRes, iRes] = await Promise.all([
      api.members.list(),
      api.members.listInvites(),
    ]);
    members = mRes.data ?? [];
    invites = iRes.data ?? [];
  } catch {
    // API unavailable
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">Team Members</h1>
        <p className="text-[var(--muted-foreground)] text-sm">Manage who has access to this workspace.</p>
      </div>

      <div className="space-y-2">
        {members.map((m) => (
          <div
            key={m.userId}
            className="flex items-center justify-between border border-[var(--border)] rounded-lg px-4 py-3"
          >
            <div>
              <p className="font-medium text-sm">{m.name ?? m.email ?? m.userId}</p>
              {m.name && <p className="text-xs text-[var(--muted-foreground)]">{m.email}</p>}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium bg-neutral-100 px-2 py-1 rounded capitalize">
                {m.role}
              </span>
              <RemoveMemberButton userId={m.userId} />
            </div>
          </div>
        ))}
        {members.length === 0 && (
          <p className="text-[var(--muted-foreground)] text-sm">No members yet.</p>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Invite Member</h2>
        <InviteForm />
      </div>

      {invites.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Pending Invites</h2>
          <div className="space-y-2">
            {invites.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between border border-[var(--border)] rounded-lg px-4 py-3"
              >
                <div>
                  <p className="font-medium text-sm">{inv.email}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    Role: {inv.role} · Expires {new Date(inv.expiresAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-1 rounded">
                    Pending
                  </span>
                  <RevokeInviteButton inviteId={inv.id} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
