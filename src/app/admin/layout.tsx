import Link from "next/link";
import { cookies } from "next/headers";
import { LogoutButton } from "@/components/admin/LogoutButton";

const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/hero", label: "Carrossel" },
  { href: "/admin/evento", label: "O Evento" },
  { href: "/admin/programacao", label: "Programação" },
  { href: "/admin/preletores", label: "Preletores" },
  { href: "/admin/planos", label: "Planos" },
  { href: "/admin/local", label: "Local" },
  { href: "/admin/contato", label: "Contato" },
  { href: "/admin/sociais", label: "Redes Sociais" },
  { href: "/admin/inscricoes", label: "Inscrições" },
  { href: "/admin/banners", label: "Banners" },
  { href: "/admin/conteudo", label: "Conteúdo" },
  { href: "/admin/configuracoes", label: "Configurações" },
];

const INSCRICOES_NAV = [
  { href: "/admin/inscricoes", label: "Inscrições" },
];

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jar = await cookies();

  const adminToken = jar.get("admin_auth")?.value;
  const authSecret = process.env.AUTH_SECRET;
  const isFullAdmin = Boolean(adminToken && authSecret && adminToken === authSecret);

  const inscToken = jar.get("inscricoes_auth")?.value;
  const inscSecret = process.env.INSCRICOES_SECRET;
  const isInscricoesOnly = !isFullAdmin && Boolean(inscToken && inscSecret && inscToken === inscSecret);

  const navItems = isInscricoesOnly ? INSCRICOES_NAV : ADMIN_NAV;

  return (
    <div className="adminShell">
      <aside className={`adminSidebar${isInscricoesOnly ? " adminSidebarInscricoes" : ""}`}>
        <Link className="adminBrand" href="/">
          <span>CONAD</span>
          <strong>2026</strong>
        </Link>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <Link href="/" className="adminBrandLogo">
          <img src="/images/novo-logo.png" alt="CONAD 2026" />
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
            <h1>INSCRIÇÕES CONAD 2026</h1>
          </div>
          <LogoutButton />
        </header>
        {children}
      </div>
    </div>
  );
}
