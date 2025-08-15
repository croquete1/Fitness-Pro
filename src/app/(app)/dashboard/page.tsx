// src/app/(app)/dashboard/page.tsx
import React from "react";
import Sidebar from "@/components/Sidebar";
import NotificationsPanel from "@/components/Notifications";

export default function Dashboard() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginTop: 0 }}>Dashboard</h1>
        <NotificationsPanel />
      </main>
    </div>
  );
}
