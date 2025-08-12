// src/app/(app)/dashboard/trainer/layout.tsx
import { ReactNode } from "react";
import SidebarWrapper from "@/components/SidebarWrapper";
import Header from "@/components/Header";

export const dynamic = "force-dynamic";

export default function TrainerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh w-full">
      <div className="flex">
        <SidebarWrapper />
        <div className="flex-1">
          <Header />
          <main className="p-4">{children}</main>
        </div>
      </div>
    </div>
  );
}
