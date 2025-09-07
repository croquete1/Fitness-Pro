// src/components/dashboard/SessionsTrendCard.tsx
'use client';
import React from 'react';

export default function SessionsTrendCard() {
  return (
    <div className="card" style={{ padding: 12, minHeight: 220, display: 'grid', alignItems: 'center', justifyItems: 'center' }}>
      <div className="text-muted small" style={{ position: 'absolute', top: 12, left: 12 }}>
        Tendência de sessões (7 dias)
      </div>
      <div className="text-muted">— gráfico —</div>
    </div>
  );
}
