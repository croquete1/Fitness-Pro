import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";
import ApprovalsClient from "@/components/admin/ApprovalsClient";

export const dynamic = "force-dynamic";

export default async function Page() {
  await requireAdmin();
  const initial = await prisma.user.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
  });

  // o ApprovalsClient que já tens trabalha com este shape
  return <ApprovalsClient initial={initial as any} />;
}
