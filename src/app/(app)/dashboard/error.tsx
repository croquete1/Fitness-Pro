'use client';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{ minHeight: '50vh', display:'grid', placeItems:'center', gap:12 }}>
      <div>Ocorreu um erro ao carregar o painel.</div>
      <pre style={{ fontSize:12, opacity:.7, maxWidth:640, whiteSpace:'pre-wrap' }}>{error.message}</pre>
      <button className="btn" onClick={() => reset()}>Tentar de novo</button>
    </div>
  );
}
