import { InviteForm } from "./invite-form";

type Member = {
  userId: string;
  email: string | null;
  name: string | null;
  role: string;
  createdAt: string;
};

type Invite = { id: string; email: string; role: string; expiresAt: string };

const API = process.env.PLATFORM_API_URL ?? "http://localhost:4100";
const DEV_TENANT = process.env.DEV_TENANT_ID ?? "dev-tenant-id";

function mockHeaders() {
  return {
    "x-tenant-id": DEV_TENANT,
    "x-user-id": "dev-user-id",
    "x-role": "owner",
  };
}

export default async function MembersPage() {
  let members: Member[] = [];
  let invites: Invite[] = [];

  try {
    const [mRes, iRes] = await Promise.all([
      fetch(`${API}/v1/members`, { headers: mockHeaders() }),
      fetch(`${API}/v1/members/invites`, { headers: mockHeaders() }),
    ]);
    if (mRes.ok) ({ data: members } = await mRes.json());
    if (iRes.ok) ({ data: invites } = await iRes.json());
  } catch {
    // API unavailable
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">Team Members</h1>
        <p className="text-neutral-500 text-sm">Manage who has access to this workspace.</p>
      </div>

      <div className="space-y-2">
        {members.map((m) => (
          <div key={m.userId} className="flex items-center justify-between border border-neutral-200 rounded-lg px-4 py-3">
            <div>
              <p className="font-medium text-sm">{m.name ?? m.email ?? m.userId}</p>
              {m.name && <p className="text-xs text-neutral-400">{m.email}</p>}
            </div>
            <span className="text-xs font-medium bg-neutral-100 px-2 py-1 rounded capitalize">{m.role}</span>
          </div>
        ))}
        {members.length === 0 && <p className="text-neutral-400 text-sm">No members yet.</p>}
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
              <div key={inv.id} className="flex items-center justify-between border border-neutral-200 rounded-lg px-4 py-3">
                <div>
                  <p className="font-medium text-sm">{inv.email}</p>
                  <p className="text-xs text-neutral-400">Role: {inv.role} · Expires {new Date(inv.expiresAt).toLocaleDateString()}</p>
                </div>
                <span className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-1 rounded">Pending</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
