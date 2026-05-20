import Link from "next/link";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/banners", label: "Banners" },
  { href: "/admin/conteudo", label: "Conteudo" },
];

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="adminShell">
      <aside className="adminSidebar">
        <Link className="adminBrand" href="/">
          <span>CONAD</span>
          <strong>2026</strong>
        </Link>
        <nav className="adminNav" aria-label="Navegacao do admin">
          {navItems.map((item) => (
            <Link href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="adminContent">
        <header className="adminTopbar">
          <div>
            <p>Painel administrativo</p>
            <h1>CMS CONAD 2026</h1>
          </div>
          <Link className="adminPreviewLink" href="/">
            Ver site
          </Link>
        </header>
        {children}
      </div>
    </div>
  );
}
