import Image from "next/image";
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
  {
    title: "CONECTE-SE",
    links: [
      { label: "Instagram", href: "#" },
      { label: "Facebook", href: "#" },
      { label: "YouTube", href: "#" },
      { label: "WhatsApp", href: "#" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="saksFooter">
      <div className="saksFooterInner">
        <Link href="/" className="saksFooterLogo">
          <Image
            src="/images/conad-logo.png"
            width={160}
            height={56}
            alt="CONAD 2026"
          />
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
        </div>

        <div className="saksFooterDivider" />

        <p className="saksFooterCopy">
          © 2026 CONAD — Conferência Nacional. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
