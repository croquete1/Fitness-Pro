type KPIProps = {
  label: string;
  value: number | string;
  hint?: string;
};

export default function KPI({ label, value, hint }: KPIProps) {
  return (
    <div className="card" style={{ padding: 16, display: 'grid', gap: 4 }}>
      <span className="neo-surface__hint text-xs uppercase tracking-wide text-muted">{label}</span>
      <span className="neo-surface__value text-2xl font-semibold text-fg">{value}</span>
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </div>
  );
}
