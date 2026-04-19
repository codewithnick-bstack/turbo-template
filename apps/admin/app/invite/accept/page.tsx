import { notFound } from "next/navigation";
import AcceptInviteClient from "./accept-invite-client";

const API = process.env.PLATFORM_API_URL ?? "http://localhost:4100";

type Props = { searchParams: Promise<{ token?: string }> };

type InviteInfo = {
  id: string;
  email: string;
  role: string;
  tenantId: string;
  status: string;
  expiresAt: string;
};

export default async function InviteAcceptPage({ searchParams }: Props) {
  const { token } = await searchParams;
  if (!token) return notFound();

  let invite: InviteInfo | null = null;
  let error = "";

  try {
    const res = await fetch(`${API}/v1/members/invite/info?token=${encodeURIComponent(token)}`);
    if (res.ok) {
      invite = (await res.json()) as InviteInfo;
    } else {
      const body = (await res.json()) as { message?: string };
      error = body.message ?? "Invite not found";
    }
  } catch {
    error = "Unable to reach the server";
  }

  if (error || !invite) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="bg-white rounded-2xl border border-neutral-200 p-8 max-w-sm w-full text-center">
          <p className="text-red-600 text-sm">{error || "Invalid invite link"}</p>
        </div>
      </div>
    );
  }

  if (invite.status !== "pending") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="bg-white rounded-2xl border border-neutral-200 p-8 max-w-sm w-full text-center">
          <p className="text-sm text-neutral-500">
            This invite has already been {invite.status}.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <AcceptInviteClient token={token} invite={invite} />
    </div>
  );
}
