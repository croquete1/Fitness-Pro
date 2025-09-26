'use client';

import * as React from 'react';

export default function HeaderBell() {
  const [has, setHas] = React.useState(false);
  React.useEffect(() => {
    // stub; podes trocar por dados reais
    const t = setTimeout(() => setHas(true), 1200);
    return () => clearTimeout(t);
  }, []);
  return (
    <button className="btn icon" aria-label="Notificações">
      <span style={{ position: 'relative', display: 'inline-block' }}>
        🔔
        {has && (
          <span style={{
            position:'absolute', top:-2, right:-2, width:8, height:8,
            background:'var(--danger)', borderRadius:999
          }}/>
        )}
      </span>
    </button>
  );
}
