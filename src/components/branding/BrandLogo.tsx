'use client';

import * as React from 'react';
import Image from 'next/image';

type Props = { size?: number; className?: string };

export default function BrandLogo({ size = 56, className }: Props) {
  const [src, setSrc] = React.useState<string>('/logo.png'); // tenta este primeiro
  const [broken, setBroken] = React.useState(false);

  React.useEffect(() => {
    // se /logo.png não existir, tenta /branding/logo.svg e por fim mostra texto
    if (broken) setSrc('/branding/logo.svg');
  }, [broken]);

  if (broken && src === '/branding/logo.svg') {
    // fallback final: texto estilizado
    return (
      <div className={className} style={{ fontWeight: 800, fontSize: size * 0.6 }}>
        Fitness <span style={{ color: '#1976d2' }}>Pro</span>
      </div>
    );
  }

  return (
    <Image
      className={className}
      src={src}
      alt="Fitness Pro"
      width={size}
      height={size}
      onError={() => setBroken(true)}
      priority
    />
  );
}
