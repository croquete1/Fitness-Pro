"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

type Hit = { id: string; name: string; email?: string };

export default function Topbar({ role }: { role?: string | null }) {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  const placeholder = "Pesquisar cliente por nome ou email…";
  const targetUrl = useMemo(() => {
    // para Admin abre a lista de utilizadores filtrada; para PT abre a listagem de clientes
    if ((role ?? "ADMIN").toUpperCase() === "TRAINER") return "/dashboard/pt-clientes";
    return "/dashboard/admin/users";
  }, [role]);

  useEffect(() => { setOpen(false); }, [pathname]);

  // mini-autocomplete
  useEffect(() => {
    const controller = new AbortController();
    const run = async () => {
      if (!q.trim()) { setHits([]); return; }
      try {
        const r = await fetch(`/api/search/clients?q=${encodeURIComponent(q)}&limit=6`, { signal: controller.signal });
        const j = await r.json();
        setHits(Array.isArray(j?.data) ? j.data : []);
        setOpen(true);
      } catch { /* ignore */ }
    };
    const t = setTimeout(run, 180);
    return () => { clearTimeout(t); controller.abort(); };
  }, [q]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!box.current) return;
      if (!box.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <header className="fp-header">
      <div className="fp-header-inner">
        <div />
        {/* Pesquisa central */}
        <div ref={box} style={{ position: "relative" }}>
          <input
            type="search"
            aria-label="Pesquisa"
            placeholder={placeholder}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                router.push(`${targetUrl}?q=${encodeURIComponent(q)}`);
                setOpen(false);
              }
            }}
            style={{
              width: "min(680px, 88vw)",
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid var(--border)",
              background: "var(--bg)",
              color: "var(--fg)",
              outline: "none",
            }}
          />
          {open && hits.length > 0 && (
            <div className="card" style={{
              position: "absolute", top: "100%", left: 0, width: "100%", marginTop: 6,
              overflow: "hidden", zIndex: 45
            }}>
              {hits.map(h => (
                <button key={h.id}
                  onClick={() => { router.push(`${targetUrl}?q=${encodeURIComponent(h.name || h.email || "")}`); setOpen(false); }}
                  style={{ display: "flex", width: "100%", textAlign: "left", gap: 8, padding: 10, border: "none", background: "transparent", cursor: "pointer" }}
                >
                  <span style={{ fontWeight: 700 }}>{h.name}</span>
                  <span className="text-muted"> {h.email ? `• ${h.email}` : ""}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Botões à direita */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button className="pill" onClick={() => signOut({ callbackUrl: "/login" })}
            title="Terminar sessão" style={{ padding: "8px 12px" }}>
            Terminar sessão
          </button>
        </div>
      </div>
    </header>
  );
}
