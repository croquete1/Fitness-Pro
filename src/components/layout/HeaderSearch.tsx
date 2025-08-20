'use client';

import { Search } from 'lucide-react';
import { useState } from 'react';

export default function HeaderSearch() {
  const [q, setQ] = useState('');

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <Search
        size={16}
        aria-hidden
        style={{
          position: 'absolute',
          left: 12,
          top: '50%',
          transform: 'translateY(-50%)',
          opacity: .7,
        }}
      />
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Pesquisar cliente por nome ou email..."
        aria-label="Pesquisar"
        style={{
          width: '100%',
          padding: '10px 12px 10px 34px',
          borderRadius: 12,
          border: '1px solid var(--border)',
          background: 'var(--card)',
          color: 'var(--fg)',
          outline: 'none',
        }}
      />
    </div>
  );
}
