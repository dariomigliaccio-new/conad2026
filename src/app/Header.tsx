"use client";
import { useState } from "react";
import Link from "next/link";

const NAV = [
  { label: "O EVENTO", href: "/evento" },
  { label: "PROGRAMAÇÃO", href: "/programacao" },
  { label: "PRELETORES", href: "/preletores" },
  { label: "PLANOS", href: "/planos" },
  { label: "LOCAL", href: "/local" },
  { label: "CONTATO", href: "/contato" },
];

type Props = { logo: string; logoAlt: string };

export default function Header({ logo, logoAlt }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="saksHeader">
        <div className="saksHeaderTop">
          <button
            className="saksHamburger"
            onClick={() => setOpen(o => !o)}
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
          >
            {open ? (
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M5 5l12 12M17 5L5 17" />
              </svg>
            ) : (
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M3 6h16M3 11h16M3 16h16" />
              </svg>
            )}
          </button>

          <Link href="/" className="saksLogo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logo} alt={logoAlt} style={{ height: 56, width: "auto", display: "block" }} />
          </Link>

          <div />
        </div>

        <nav className="saksNav" aria-label="Menu principal">
          {NAV.map(item => (
            <Link key={item.label} href={item.href} className="saksNavLink">
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <div className={`saksMobileMenu${open ? " isOpen" : ""}`} aria-hidden={!open}>
        <nav>
          {NAV.map(item => (
            <Link
              key={item.label}
              href={item.href}
              className="saksMobileLink"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      {open && <div className="saksMobileOverlay" onClick={() => setOpen(false)} />}
    </>
  );
}
