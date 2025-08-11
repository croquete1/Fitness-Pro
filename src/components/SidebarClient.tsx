"use client";

export type RawUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  role: "ADMIN" | "TRAINER" | "CLIENT";
};

type Props = { user: RawUser };

const navItems = (user: RawUser) => [
  { href: "/dashboard", label: "Dashboard", show: true },
  { href: "/trainer", label: "PT", show: user.role === "TRAINER" || user.role === "ADMIN" },
  { href: "/admin", label: "Administração", show: user.role === "ADMIN" },
];

export default function SidebarClient({ user }: Props) {
  const items = navItems(user).filter((i) => i.show);

  return (
    <aside className="w-64 shrink-0 border-r bg-white">
      <div className="p-4">
        <div className="mb-4">
          <div className="text-xs uppercase opacity-60">Utilizador</div>
          <div className="text-sm font-medium truncate">{user.name || user.email}</div>
          <div className="text-xs rounded bg-black/5 inline-block px-2 py-0.5 mt-1">
            {user.role}
          </div>
        </div>

        <nav className="grid gap-1">
          {items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm hover:bg-black/5"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </aside>
  );
}
