export default function LoadingPlanView() {
  return (
    <div style={{ padding: 16 }}>
      <div className="card" style={{ padding: 12 }}>
        <div className="flex items-center gap-3">
          <div className="animate-spin h-5 w-5 rounded-full border-2 border-gray-400 border-t-transparent" />
          <span>A carregar plano…</span>
        </div>
      </div>
    </div>
  );
}
