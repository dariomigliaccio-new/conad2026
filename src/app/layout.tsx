import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CONAD 2026",
  description: "Conferencia Nacional CONAD 2026.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
