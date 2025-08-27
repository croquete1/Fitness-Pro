// src/components/ui/ToastHost.tsx
'use client';
import { useEffect, useState } from 'react';

export default function ToastHost({
  success, error, timeout = 3200,
}: { success?: string; error?: string; timeout?: number; }) {
  const [msg, setMsg] = useState<{ t: 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => { if (success) setMsg({ t:'ok', text: success }); else if (error) setMsg({ t:'err', text: error }); }, [success, error]);
  useEffect(() => { if (!msg) return; const id = setTimeout(() => setMsg(null), timeout); return () => clearTimeout(id); }, [msg, timeout]);

  if (!msg) return null;
  return (
    <div className="fixed inset-x-0 top-4 z-[11000] flex justify-center px-4" aria-live="polite">
      <div className={`rounded-xl border px-4 py-2 shadow-lg animate-in fade-in-0 slide-in-from-top-2
        ${msg.t === 'ok' ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                         : 'bg-red-50 border-red-200 text-red-900'}`}>
        {msg.text}
      </div>
    </div>
  );
}
