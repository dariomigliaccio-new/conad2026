import Image from "next/image";
import { Countdown } from "@/components/Countdown";
import { HeroCarousel } from "@/components/HeroCarousel";
import { experienceCards, heroSlides } from "@/data/home";

export default function Home() {
  return (
    <>
      <header className="siteHeaderWrap">
        <div className="siteHeader">
          <a className="brand" href="#" aria-label="CONAD 2026">
            <Image
              src="/images/conad-logo.png"
              width={499}
              height={175}
              alt="CONAD"
              priority
            />
          </a>
          <nav className="mainNav" aria-label="Navegacao principal">
            <a href="#planos">Preços</a>
            <a href="#informacoes">Informações</a>
            <a href="#preletores">Preletores</a>
            <a href="#local">Local</a>
          </nav>
          <a className="headerCta" href="#inscricao">
            Inscreva-se
          </a>
        </div>
      </header>

      <main>
        <HeroCarousel slides={heroSlides} />

        <section className="plansSection" id="planos">
          <div className="sectionHeader centered">
            <h2>Encontre a experiência certa para você.</h2>
            <p>Não importa de onde você vem, presencial ou online, participe da CONAD 2026.</p>
          </div>
          <div className="experienceGrid">
            {experienceCards.map((card) => (
              <article className="experienceItem" key={card.title}>
                <span className="planIcon" aria-hidden="true">◇</span>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
                <a href="#inscricao">{card.link} <span aria-hidden="true">›</span></a>
              </article>
            ))}
          </div>
          <a className="plansCta" href="#inscricao">Inscreva-se agora <span aria-hidden="true">›</span></a>
        </section>

        <Countdown />
      </main>

      <footer className="siteFooter" id="local">
        <Image
          src="/images/logos_footer.png"
          width={580}
          height={170}
          alt="CONFRADEB"
          className="footerLogo"
        />
        <div className="socialLinks" aria-label="Mídias sociais">
          <a href="#" aria-label="Instagram">IG</a>
          <a href="#" aria-label="Facebook">FB</a>
          <a href="#" aria-label="YouTube">YT</a>
        </div>
        <p>CONFRADEB - Concilio Distrital Brasileiro 4000 N. Federal Hwy. - Lighthouse Point , FL 33064 - USA</p>
        <small>© 2026 Brazilian District Council of the Assemblies of God. All Rights Reserved© 2022 Assembly of God Bethlehem Ministry. All Rights Reserved</small>
      </footer>
    </>
  );
}
