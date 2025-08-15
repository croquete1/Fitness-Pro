// src/app/(app)/dashboard/page.tsx
import AdminHome from "@/components/dashboard/AdminHome";

export const dynamic = "force-dynamic";

export default async function DashboardHomePage() {
  // Server component simples que delega os fetches ao client component
  return <AdminHome />;
}
