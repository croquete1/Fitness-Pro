'use client';
export default function Spinner({ size = 16 }: { size?: number }) {
  const s = `${size}px`;
  return (
    <span
      aria-busy
      style={{
        width: s, height: s, display: 'inline-block',
        border: '2px solid var(--border)', borderTopColor: 'var(--fg)',
        borderRadius: '50%', animation: 'fp-spin 800ms linear infinite'
      }}
    />
  );
}
