"use client";

import { useEffect } from "react";

export default function PlanViewBeacon({ planId }: { planId: string }) {
  useEffect(() => {
    if (!planId) return;
    const controller = new AbortController();
    // envia sinal que o cliente abriu o plano
    fetch(`/api/pt/plans/${encodeURIComponent(planId)}/view`, {
      method: "POST",
      signal: controller.signal,
      credentials: "include",
    }).catch(() => {});
    return () => controller.abort();
  }, [planId]);

  return null;
}
