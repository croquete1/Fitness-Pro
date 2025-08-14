// src/app/(app)/dashboard/messages/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const metadata = { title: "Mensagens · Dashboard" };
export const dynamic = "force-dynamic"; // garante que não fica estática

type Message = {
  id: string;
  from: string;
  subject: string;
  preview: string;
  createdAt: string;
  unread: boolean;
};

// TODO: substituir por leitura via Prisma quando quisermos persistência real
async function loadMessagesSSR(_userId: string): Promise<Message[]> {
  return [
    {
      id: "m1",
      from: "sistema@fitnesspro.app",
      subject: "Bem-vindo à Fitness Pro",
      preview: "A tua conta foi criada com sucesso.",
      createdAt: new Date().toISOString(),
      unread: true,
    },
    {
      id: "m2",
      from: "andre@fitnesspro.app",
      subject: "Plano atualizado",
      preview: "Já tens o plano de perna com foco em extensão...",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      unread: false,
    },
  ];
}

export default async function MessagesPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;

  if (!userId) {
    return (
      <div style={{ padding: "1rem" }}>
        <h1 style={{ fontSize: "1.5rem", marginBottom: ".75rem" }}>Mensagens</h1>
        <p style={{ color: "var(--muted)" }}>Não foi possível carregar a sessão. Por favor, volta a iniciar sessão.</p>
      </div>
    );
  }

  let items: Message[] = [];
  try {
    items = await loadMessagesSSR(userId);
  } catch {
    items = [];
  }

  return (
    <div style={{ padding: "1rem" }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: ".75rem" }}>Mensagens</h1>

      {items.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>Sem mensagens para apresentar.</p>
      ) : (
        <ul style={{ display: "grid", gap: 8 }}>
          {items.map((m) => (
            <li
              key={m.id}
              style={{
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: ".75rem .9rem",
                background: m.unread ? "var(--chip)" : "transparent",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <strong style={{ lineHeight: 1.2 }}>{m.subject}</strong>
                <span style={{ fontSize: ".8rem", color: "var(--muted)" }}>
                  {new Date(m.createdAt).toLocaleString()}
                </span>
              </div>
              <div style={{ fontSize: ".9rem", color: "var(--muted)", marginTop: 6 }}>
                <em>{m.from}</em> — {m.preview}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
