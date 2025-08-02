"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Client = { id: string; nome: string };

export default function ClientDashboardPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [error, setError] = useState<string>();

  useEffect(() => {
    supabase
      .from("clients")
      .select("id, nome")
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else if (data) setClients(data);
      });
  }, []);

  return (
    <main className="p-6">
      ...
    </main>
  );
}
