import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Archivio Calcio Italiano",
  description: "Draft storica della Serie A"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
