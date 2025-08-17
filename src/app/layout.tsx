import "./globals.css";
import Providers from "./providers";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-PT" suppressHydrationWarning>
      <body>
        <div className="fp-shell">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
