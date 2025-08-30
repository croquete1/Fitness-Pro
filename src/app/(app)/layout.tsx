// src/app/layout.tsx
import './globals.css';

export const metadata = { title: 'Fitness Pro' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-PT">
      <body>{children}</body>
    </html>
  );
}
