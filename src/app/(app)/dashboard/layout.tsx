// Não importes globals.css aqui. Já é carregado no layout raiz: src/app/(app)/layout.tsx
// Mantém este layout fino, apenas a renderizar os children.

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
