import type { Metadata } from "next";
import { TeamMemberForm } from "../team-form";

export const metadata: Metadata = { title: "Add Team Member" };

export default function NewTeamMemberPage() {
  return (
    <div className="max-w-xl">
      <h1 className="mb-6 text-2xl font-bold">Add team member</h1>
      <TeamMemberForm />
    </div>
  );
}
