"use client";

import React from "react";

type HeaderSearchProps = {
  placeholder?: string;
  /** Chamado quando submetes a pesquisa (ENTER ou ícone) */
  onSearch?: (query: string) => void;
  /** Query inicial, caso queiras pré-preencher */
  defaultQuery?: string;
};

export default function HeaderSearch({
  placeholder = "Pesquisar…",
  onSearch,
  defaultQuery = "",
}: HeaderSearchProps) {
  const [q, setQ] = React.useState(defaultQuery);
  const [focused, setFocused] = React.useState(false);

  function submit(formEvent?: React.FormEvent) {
    if (formEvent) formEvent.preventDefault();
    const query = q.trim();
    if (!query) return;

    // Evento local para futuros listeners (ex.: ligar ao /api/clients)
    try {
      window.dispatchEvent(new CustomEvent("app:search", { detail: { query } }));
    } catch {
      /* noop */
    }
    onSearch?.(query);
  }

  return (
    <form
      onSubmit={submit}
      role="search"
      aria-label="Pesquisa"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        minWidth: 220,
        flex: 1,
        maxWidth: 560,
      }}
    >
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          width: "100%",
        }}
      >
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          aria-label="Campo de pesquisa"
          autoCorrect="off"
          spellCheck={false}
          style={{
            width: "100%",
            height: 36,
            padding: "0 36px 0 36px",
            borderRadius: 8,
            border: "1px solid var(--border, #dcdcdc)",
            outline: focused ? "2px solid var(--focus, #8ab4f8)" : "none",
            background: "var(--input-bg, rgba(0,0,0,0.02))",
          }}
        />
        {/* Ícone lupa (decorativo) */}
        <span
          aria-hidden="true"
          style={{ position: "absolute", left: 10, display: "inline-flex" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="2" />
          </svg>
        </span>
        {/* Botão submit */}
        <button
          type="submit"
          aria-label="Submeter pesquisa"
          style={{
            position: "absolute",
            right: 4,
            height: 28,
            width: 28,
            borderRadius: 6,
            border: "1px solid var(--border, #dcdcdc)",
            background: "var(--btn-bg, #fff)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path
              d="M5 12h14M13 5l7 7-7 7"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </form>
  );
}
