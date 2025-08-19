"use client";

import React, { useEffect, useRef, useState } from "react";

export default function HeaderSearch() {
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // atalhos: "/" ou "Ctrl+K" focam a procura
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      const isTyping = tag === "input" || tag === "textarea" || (e.target as HTMLElement)?.isContentEditable;
      if (isTyping) return;

      const ctrlK = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k";
      const slash = e.key === "/";

      if (ctrlK || slash) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // por agora só previne o submit — integra com a tua rota de pesquisa quando quiseres
    // ex: router.push(`/dashboard/search?q=${encodeURIComponent(q.trim())}`)
  };

  return (
    <form className="fp-search" role="search" aria-label="Procurar" onSubmit={onSubmit}>
      <button className="fp-search-icon" type="submit" aria-label="Procurar">
        🔎
      </button>
      <input
        ref={inputRef}
        className="fp-search-input"
        placeholder="Pesquisar cliente por nome ou email…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <kbd className="fp-search-kbd">/</kbd>
      <kbd className="fp-search-kbd hide-sm">⌘K</kbd>
    </form>
  );
}
