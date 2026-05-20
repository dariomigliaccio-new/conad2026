import Image from "next/image";

export default function Home() {
  return (
    <main className="holdingPage">
      <section className="holdingPanel" aria-label="CONAD 2026">
        <Image
          src="/images/conad-logo.png"
          width={499}
          height={175}
          alt="CONAD"
          className="holdingLogo"
          priority
        />
      </section>
    </main>
  );
}
