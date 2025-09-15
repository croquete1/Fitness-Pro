// src/components/dashboard/GreetingHeader.tsx
'use client';

import React from 'react';

type Role = 'ADMIN' | 'PT' | 'TRAINER' | 'CLIENT' | string | null;

function getGreeting(): { greet: string; wave: string } {
  const h = new Date().getHours();
  if (h >= 0 && h < 6) return { greet: 'Boa madrugada', wave: '🌙' };
  if (h < 12) return { greet: 'Bom dia', wave: '☀️' };
  if (h < 20) return { greet: 'Boa tarde', wave: '🌤️' };
  return { greet: 'Boa noite', wave: '🌙' };
}

export default function GreetingHeader({
  name,
  avatarUrl,
  role,
}: {
  name?: string | null;
  avatarUrl?: string | null;
  role?: Role; // mantido p/ eventual badge no futuro
}) {
  const { greet, wave } = getGreeting();
  const display = name && name.trim().length > 0 ? name : 'Utilizador';
  const fallback =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><rect width="100%" height="100%" rx="24" fill="#1f2937"/><text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" fill="#e5e7eb" font-family="sans-serif" font-size="44">👤</text></svg>`
    );

  return (
    <div className="w-full rounded-2xl p-4 md:p-5 bg-gradient-to-r from-slate-900/90 via-slate-800/80 to-slate-900/90 text-white shadow-sm flex items-center gap-3">
      <img
        src={avatarUrl || fallback}
        alt=""
        className="h-10 w-10 md:h-12 md:w-12 rounded-full ring-2 ring-white/20 object-cover"
      />
      <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">
        {greet}, {display} {wave}
      </h1>
    </div>
  );
}
