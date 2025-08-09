type KPIProps = {
  label: string;
  value: number | string;
  hint?: string;
};

export default function KPI({ label, value, hint }: KPIProps) {
  return (
    <div className="rounded-xl border p-4 flex flex-col gap-1">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-2xl font-semibold">{value}</span>
      {hint && <span className="text-xs text-gray-500">{hint}</span>}
    </div>
  );
}
