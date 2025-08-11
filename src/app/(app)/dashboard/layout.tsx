// src/app/(app)/trainer/layout.tsx
import { ReactNode } from "react";
import SidebarWrapper from "@/components/SidebarWrapper";
import Header from "@/components/Header";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";

export default async function TrainerLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

  const user = {
    id: (session!.user as any).id as string,
    name: session!.user.name ?? null,
    email: session!.user.email || "",
    role: (session!.user as any).role as "ADMIN" | "TRAINER" | "CLIENT",
  };

  return (
    <div className="min-h-dvh w-full">
      <div className="flex">
        <SidebarWrapper />
        <div className="flex-1">
          <Header user={user} />
          <main className="p-4">{children}</main>
        </div>
      </div>
    </div>
  );
}
