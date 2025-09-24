'use client';
import * as React from 'react';

export default function PrintBranding({ children, title = 'Fitness-Pro' }: { children: React.ReactNode; title?: string }) {
  return (
    <div className="print:bg-white print:text-black">
      <div className="hidden print:block text-center mb-4">
        <div className="text-2xl font-bold">{title}</div>
        <div className="text-xs opacity-70">Relatório / Exportação</div>
        <hr className="mt-2" />
      </div>

      {children}

      <div className="hidden print:flex justify-between text-xs opacity-70 mt-6">
        <span>Gerado por Fitness-Pro</span>
        <span>{new Date().toLocaleDateString()}</span>
      </div>

      <style jsx global>{`
        @media print {
          @page { margin: 12mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
    </div>
  );
}

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="rounded-lg px-3 py-2 border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5"
    >
      Imprimir / Exportar
    </button>
  );
}
