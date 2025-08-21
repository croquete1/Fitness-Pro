export const dynamic = "force-dynamic";

import React from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/sessions";
import { toAppRole } from "@/lib/roles";
import { getAdminStats, getPTStats, getClientStats } from "@/lib/dashboardRepo";

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const role = toAppRole(user.role);
  const data =
    role === "admin"
      ? await getAdminStats()
      : role === "pt"
      ? await getPTStats(user.id)
      : await getClientStats(user.id);

  // TODO: substituir por UI final (cards, etc.). Mantemos simples para estabilizar o deploy.
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <h1>Dashboard</h1>
      <div>
        <strong>Perfil:</strong> {role}
      </div>
      <pre style={{ whiteSpace: "pre-wrap", background: "var(--hover)", padding: 12, borderRadius: 8 }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
