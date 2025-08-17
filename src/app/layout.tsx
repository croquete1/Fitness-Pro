// src/app/layout.tsx
import "./globals.css"; // <- IMPORTA O CSS (caminho que estás a usar)

// (opcional, mas útil para SEO)
export const metadata = {
  title: "Fitness Pro",
  description: "Plataforma de gestão para admins, PTs e clientes",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt" suppressHydrationWarning>
      <head>
        {/* Aplica tema guardado sem “flash” de cores */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function () {
  try {
    var t = localStorage.getItem("fp-theme") || "light";
    document.documentElement.dataset.theme = t;
  } catch (_) {}
})();`,
          }}
        />
      </head>
      <body className="fp-app">{children}</body>
    </html>
  );
}
