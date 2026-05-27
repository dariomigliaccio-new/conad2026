import Link from "next/link";

const COLS = [
  {
    title: "O EVENTO",
    links: [
      { label: "Sobre o CONAD", href: "#evento" },
      { label: "Programação", href: "#programacao" },
      { label: "Preletores", href: "#preletores" },
      { label: "Local", href: "#local" },
    ],
  },
  {
    title: "INSCRIÇÃO",
    links: [
      { label: "Planos", href: "#planos" },
      { label: "Grupos", href: "#planos" },
      { label: "Bolsas", href: "#planos" },
      { label: "FAQ", href: "#contato" },
    ],
  },
  {
    title: "INFORMAÇÕES",
    links: [
      { label: "Hospedagem", href: "#local" },
      { label: "Translados", href: "#local" },
      { label: "Acessibilidade", href: "#contato" },
      { label: "Contato", href: "#contato" },
    ],
  },
];

const SOCIALS = [
  {
    label: "Instagram",
    href: "#",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "#",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "#",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
        <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white" />
      </svg>
    ),
  },
  {
    label: "WhatsApp",
    href: "#",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.558 4.116 1.535 5.845L.057 23.572a.75.75 0 0 0 .92.92l5.733-1.476A11.952 11.952 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75A9.75 9.75 0 1 1 12 2.25a9.75 9.75 0 0 1 0 19.5z" />
      </svg>
    ),
  },
];

type Props = { logo: string; logoAlt: string };

export default function Footer({ logo, logoAlt }: Props) {
  return (
    <footer className="saksFooter">
      <div className="saksFooterInner">
        <Link href="/" className="saksFooterLogo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo} alt={logoAlt} style={{ height: 80, width: "auto", display: "block" }} />
        </Link>

        <div className="saksFooterDivider" />

        <div className="saksFooterGrid">
          {COLS.map(col => (
            <div key={col.title} className="saksFooterCol">
              <h3 className="saksFooterColTitle">{col.title}</h3>
              <ul>
                {col.links.map(link => (
                  <li key={link.label}>
                    <Link href={link.href} className="saksFooterLink">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="saksFooterCol">
            <h3 className="saksFooterColTitle">CONECTE-SE</h3>
            <div className="saksFooterSocials">
              {SOCIALS.map(s => (
                <Link key={s.label} href={s.href} className="saksFooterSocialIcon" aria-label={s.label}>
                  {s.icon}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="saksFooterDivider" />

        <p className="saksFooterCopy">
          © 2026 CONAD — Conferência Nacional. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
