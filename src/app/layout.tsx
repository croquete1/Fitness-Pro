// src/app/layout.tsx (ROOT)
import './globals.css';
import Providers from './providers'; // se tiveres um wrapper com SessionProvider/ThemeProvider

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
