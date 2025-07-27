// src/app/layout.tsx
import React from 'react';

export const metadata = {
  title: 'A Minha App',
  description: 'App com autenticação',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body>
        {children}
      </body>
    </html>
  );
}
