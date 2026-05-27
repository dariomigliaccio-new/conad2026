import Link from "next/link";
import { LogoutButton } from "@/components/admin/LogoutButton";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/hero", label: "Carrossel" },
  { href: "/admin/evento", label: "O Evento" },
  { href: "/admin/programacao", label: "Programação" },
  { href: "/admin/preletores", label: "Preletores" },
  { href: "/admin/planos", label: "Planos" },
  { href: "/admin/local", label: "Local" },
  { href: "/admin/contato", label: "Contato" },
  { href: "/admin/sociais", label: "Redes Sociais" },
  { href: "/admin/banners", label: "Banners" },
  { href: "/admin/conteudo", label: "Conteúdo" },
  { href: "/admin/configuracoes", label: "Configurações" },
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
        <LogoutButton />
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
