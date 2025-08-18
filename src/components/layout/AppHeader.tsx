"use client";

import React from "react";

export default function AppHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-black/5 bg-white/80 backdrop-blur-md dark:bg-zinc-900/70">
      <div className="mx-auto flex max-w-[1400px] items-center justify-end gap-3 px-6 py-3">
        {/* aqui pode manter sinos, tema, logout, etc. */}
        <span title="Notificações">🔔</span>
        <span title="Tema">🌙</span>
        <a
          href="/api/auth/signout"
          className="inline-flex items-center rounded-xl border border-black/5 px-3 py-1.5 text-sm shadow-sm hover:bg-white transition"
        >
          Terminar sessão
        </a>
      </div>
    </header>
  );
}
