// src/app/(app)/dashboard/admin/approvals/page.tsx
import ApprovalsClient from "@/components/admin/ApprovalsClient";

export const dynamic = "force-dynamic";

export default function ApprovalsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-semibold">Aprovações de Conta</h1>
          <p className="text-sm text-muted-foreground">
            Revê e gere pedidos de registo pendentes.
          </p>
        </div>
      </div>

      <ApprovalsClient />
    </div>
  );
}
