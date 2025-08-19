// src/app/error.tsx
"use client";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html>
      <body style={{ padding: 24, fontFamily: "ui-sans-serif, system-ui" }}>
        <h2>Ocorreu um erro 🚧</h2>
        <pre style={{ whiteSpace: "pre-wrap" }}>{error?.message}</pre>
        <button onClick={reset} style={{ marginTop: 12, padding: "8px 12px", borderRadius: 8 }}>
          Tentar novamente
        </button>
      </body>
    </html>
  );
}
