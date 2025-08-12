// src/app/(app)/dashboard/admin/approvals/page.tsx
import ApprovalsClient from "@/components/admin/ApprovalsClient";

export const dynamic = "force-dynamic";

export default function ApprovalsPage() {
  return (
    <div className="space-y-6 p-2 md:p-4">
      <div>
        <h1 className="text-2xl font-semibold">Aprovações de conta</h1>
        <p className="text-sm text-muted-foreground">
          Revê pedidos de registo pendentes e aprova/rejeita.
        </p>
      </div>
      <ApprovalsClient />
    </div>
  );
}
