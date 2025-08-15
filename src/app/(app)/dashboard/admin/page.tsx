// src/app/(app)/dashboard/admin/page.tsx
import AdminHome from "@/components/dashboard/AdminHome";

export const metadata = {
  title: "Admin · Início — Fitness Pro",
  description: "Resumo do dia, KPIs e atividade recente para administradores.",
};

export default function AdminOverviewPage() {
  return <AdminHome />;
}
