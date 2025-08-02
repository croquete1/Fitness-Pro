"use client";
import { useSession } from "next-auth/react";
import SidebarClient from "./SidebarClient"; // O teu sidebar real

export default function SidebarWrapper() {
  const { data: session, status } = useSession();

  if (status !== "authenticated") return null;
  // Ou podes mostrar um loading spinner enquanto status é "loading"

  return <SidebarClient user={session.user} />;
}
