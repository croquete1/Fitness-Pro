"use client";

import React from "react";

export default function TrainerDashboard() {
  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-4">Trainer Dashboard</h1>
      <section className="space-y-4">
        <div className="rounded bg-white p-4 shadow">
          <h2 className="text-xl font-semibold">Client Requests</h2>
          {/* Lista de pedidos de clientes a aceitar ou recusar */}
          <p>Sem pedidos novos.</p>
        </div>
        <div className="rounded bg-white p-4 shadow">
          <h2 className="text-xl font-semibold">Create Workout Plan</h2>
          {/* Botão ou link para criar novos planos de treino */}
          <button className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            Novo Plano
          </button>
        </div>
      </section>
    </main>
  );
}
