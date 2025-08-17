"use client";

import Topbar from "@/components/Topbar";
import { useMe } from "@/hooks/useMe";

export default function HeaderBridge() {
  const { user } = useMe();
  return <Topbar role={user?.role ?? null} />;
}
