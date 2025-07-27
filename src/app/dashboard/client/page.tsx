"use client";

import React from "react";
import { supabase } from '../../../lib/supabaseClient'
export default function ClientDashboard() {
  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-4">Client Dashboard</h1>
      <section className="space-y-4">
        <div className="rounded bg-white p-4 shadow">
          <h2 className="text-xl font-semibold">Upcoming Workouts</h2>
          {/* Aqui podes mapear as sessões agendadas do cliente */}
          <p>Nenhuma sessão agendada.</p>
        </div>
        <div className="rounded bg-white p-4 shadow">
          <h2 className="text-xl font-semibold">Progress Tracker</h2>
          {/* Gráficos, estatísticas ou métricas do progresso do cliente */}
          <p>Regista as tuas primeiras sessões para começar o tracking.</p>
        </div>
      </section>
    </main>
);
}
