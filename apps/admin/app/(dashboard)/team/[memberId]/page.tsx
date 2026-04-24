import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { serverFetch } from "@/lib/api";
import type { TeamMember } from "@/lib/types";
import { TeamMemberForm } from "../team-form";

export const metadata: Metadata = { title: "Edit Team Member" };

export default async function EditTeamMemberPage({ params }: { params: Promise<{ memberId: string }> }) {
  const { memberId } = await params;

  let member: TeamMember;
  try {
    member = await serverFetch<TeamMember>(`/team/${memberId}`);
  } catch {
    notFound();
  }

  return (
    <div className="max-w-xl">
      <h1 className="mb-6 text-2xl font-bold">Edit team member</h1>
      <TeamMemberForm member={member} />
    </div>
  );
}
