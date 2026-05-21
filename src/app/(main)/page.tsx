import Image from "next/image";

export default function Home() {
  return (
    <main className="holdingPage">
      <section className="holdingPanel" aria-label="CONAD 2026">
        <Image
          src="/images/conad-coming.png"
          width={880}
          height={900}
          alt="CONAD 2026 — Em breve"
          className="holdingLogo"
          priority
        />
      </section>
    </main>
  );
}
