import { readContent } from "@/lib/content";
import Header from "../Header";
import Footer from "../Footer";

export const dynamic = "force-dynamic";

type Global = { logo: string; logoAlt: string };

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  let global: Global = { logo: "/images/novo-logo.png", logoAlt: "CONAD 2026" };
  try {
    const data = await readContent<Global>("global");
    global = {
      logo: data.logo || "/images/novo-logo.png",
      logoAlt: data.logoAlt || "CONAD 2026",
    };
  } catch {}

  return (
    <>
      <Header logo={global.logo} logoAlt={global.logoAlt} />
      {children}
      <Footer logo={global.logo} logoAlt={global.logoAlt} />
    </>
  );
}
