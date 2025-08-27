// src/app/(app)/dashboard/pt/plans/[id]/loading.tsx
export default function Loading() {
  return (
    <div className="p-4 grid gap-3">
      <div className="h-7 w-64 rounded-lg bg-gray-200 animate-pulse" />
      <div className="card p-3 grid gap-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="h-16 rounded-lg bg-gray-100 animate-pulse" />
          <div className="h-16 rounded-lg bg-gray-100 animate-pulse" />
          <div className="h-16 rounded-lg bg-gray-100 animate-pulse" />
          <div className="h-16 rounded-lg bg-gray-100 animate-pulse" />
        </div>
        <div className="h-28 rounded-lg bg-gray-100 animate-pulse" />
        <div className="h-40 rounded-lg bg-gray-100 animate-pulse" />
      </div>
    </div>
  );
}
