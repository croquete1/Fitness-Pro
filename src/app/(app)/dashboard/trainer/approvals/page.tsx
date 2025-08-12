import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/authOptions";
import WorkoutApprovalList from "@/components/trainer/WorkoutApprovalList";

export const dynamic = "force-dynamic";

export default async function ApprovalsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?callbackUrl=/dashboard/trainer/approvals");

  const role = (session.user as any).role as "ADMIN" | "TRAINER" | "CLIENT" | undefined;
  if (!(role === "ADMIN" || role === "TRAINER")) {
    redirect("/dashboard");
  }

  return (
    <div className="rounded-2xl border p-4 bg-card/50 backdrop-blur">
      <h1 className="mb-4 text-xl font-semibold">Aprovações</h1>
      <WorkoutApprovalList />
    </div>
  );
}
