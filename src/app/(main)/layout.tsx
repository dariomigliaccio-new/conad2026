import Header from "../Header";
import Footer from "../Footer";

export const dynamic = "force-dynamic";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header logo="/images/novo-logo.png" logoAlt="CONAD 2026" />
      {children}
      <Footer logo="/images/novo-logo.png" logoAlt="CONAD 2026" />
    </>
  );
}
