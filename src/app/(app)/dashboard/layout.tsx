import React from "react";
import DashboardFrame from "@/components/layout/DashboardFrame";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Server component a embrulhar o frame client
  return <DashboardFrame>{children}</DashboardFrame>;
}
