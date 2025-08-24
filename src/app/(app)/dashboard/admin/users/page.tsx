import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";
import UsersClient from "@/components/admin/UsersClient";

export const dynamic = "force-dynamic";

export default async function Page() {
  await requireAdmin();

  const perPage = 20;
  const [total, rows] = await Promise.all([
    prisma.user.count(),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: perPage,
      select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
    }),
  ]);

  return <UsersClient initial={rows as any} total={total} pageSize={perPage} />;
}
