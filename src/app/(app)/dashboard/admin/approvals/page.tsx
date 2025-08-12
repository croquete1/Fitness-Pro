// src/app/(app)/dashboard/admin/approvals/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import PendingApprovals from "@/components/admin/PendingApprovals";

export const dynamic = "force-dynamic";

export default async function AdminApprovalsPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role as "ADMIN" | "TRAINER" | "CLIENT" | undefined;
  if (!session?.user || role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Admin · Aprovações</h1>
      <PendingApprovals />
    </main>
  );
}
