import Image from "next/image";

export default function Home() {
  return (
    <main className="holdingPage">
      <Image
        src="/images/conad-coming.png"
        fill
        alt="CONAD 2026 — Em breve"
        className="holdingImage"
        priority
      />
    </main>
  );
}
