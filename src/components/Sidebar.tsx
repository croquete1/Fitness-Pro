// src/components/Sidebar.tsx (exemplo compacto)
type Item = { id: string; href?: string; icon: React.ReactNode; label: string; children?: Item[] };

const SECTIONS: { id: string; label?: string; items: Item[] }[] = [
  {
    id: "main",
    items: [
      { id: "home", href: "/dashboard", icon: <HomeIco/>, label: "Início" },
      { id: "sessions", href: "/dashboard/sessions", icon: <CalIco/>, label: "Sessões" },
      // ...
    ],
  },
  {
    id: "admin",
    label: "Administração",
    items: [
      { id: "admin-root", href: "/dashboard/admin", icon: <ShieldIco/>, label: "Administração" },
      { id: "approvals", href: "/dashboard/admin/approvals", icon: <CheckIco/>, label: "Aprovações" },
      { id: "users", href: "/dashboard/admin/users", icon: <UsersIco/>, label: "Utilizadores" },
      // ...
    ],
  },
  { id: "pt", label: "PT", items: [ /* … */ ] },
  { id: "system", label: "Sistema", items: [ /* … */ ] },
];

function NavItem({ item, currentPath }: { item: Item; currentPath: string }) {
  const active = item.href && currentPath === item.href; // apenas match exato
  return (
    <a
      className="nav-item"
      href={item.href}
      aria-current={active ? "page" : undefined}
      data-active={active ? "true" : undefined}
    >
      <span className="nav-ico">{item.icon}</span>
      <span className="nav-label">{item.label}</span>
    </a>
  );
}

export default function Sidebar({ currentPath }: { currentPath: string }) {
  return (
    <>
      {SECTIONS.map(section => (
        <div key={section.id}>
          {section.label && <div className="nav-section">{section.label}</div>}
          <div className="nav-list">
            {section.items.map(it => (
              <NavItem key={it.id} item={it} currentPath={currentPath} />
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
