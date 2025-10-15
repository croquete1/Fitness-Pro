'use client';

export default function Loading() {
  return (
    <div className="space-y-6 px-4 py-6 md:px-8">
      <div className="neo-panel">
        <div className="animate-pulse space-y-3">
          <div className="h-6 w-1/3 rounded-full bg-white/40 dark:bg-slate-800/40" />
          <div className="h-4 w-2/3 rounded-full bg-white/30 dark:bg-slate-800/30" />
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="neo-surface p-4">
            <div className="animate-pulse space-y-3">
              <div className="h-3 w-1/2 rounded-full bg-white/40 dark:bg-slate-800/40" />
              <div className="h-6 w-1/3 rounded-full bg-white/60 dark:bg-slate-700/60" />
              <div className="h-3 w-2/3 rounded-full bg-white/30 dark:bg-slate-800/30" />
            </div>
          </div>
        ))}
      </div>
      <div className="neo-panel">
        <div className="neo-table-wrapper">
          <div className="animate-pulse space-y-3 p-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-10 rounded-full bg-white/30 dark:bg-slate-800/30" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
