// src/app/layout.tsx
import './globals.css';

export const metadata = {
  title: 'Fitness Pro',
  description: 'Plataforma de treino personalizada',
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
